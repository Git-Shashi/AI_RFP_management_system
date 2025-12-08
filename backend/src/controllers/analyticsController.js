const prisma = require('../config/database');

// Get analytics dashboard data
const getAnalyticsDashboard = async (req, res) => {
  try {
    // Get total counts
    const totalRFPs = await prisma.rFP.count();
    const totalVendors = await prisma.vendor.count();
    const totalProposals = await prisma.proposal.count();

    // Get RFP status breakdown
    const rfpsByStatus = await prisma.rFP.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get proposal status breakdown
    const proposalsByStatus = await prisma.proposal.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get average proposal price per RFP
    const avgProposalPricePerRFP = await prisma.proposal.groupBy({
      by: ['rfpId'],
      _avg: {
        totalPrice: true,
      },
      _count: true,
    });

    // Get RFPs with proposal counts
    const rfpsWithProposalCounts = await prisma.rFP.findMany({
      select: {
        id: true,
        title: true,
        budget: true,
        status: true,
        deadline: true,
        createdAt: true,
        _count: {
          select: {
            proposals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get vendor performance (proposals submitted)
    const vendorPerformance = await prisma.vendor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        category: true,
        _count: {
          select: {
            proposals: true,
          },
        },
      },
      orderBy: {
        proposals: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Get proposal price statistics
    const proposalStats = await prisma.proposal.aggregate({
      _avg: {
        totalPrice: true,
      },
      _min: {
        totalPrice: true,
      },
      _max: {
        totalPrice: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Get proposals with RFP and vendor details
    const recentProposals = await prisma.proposal.findMany({
      include: {
        rfp: {
          select: {
            id: true,
            title: true,
            budget: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        receivedAt: 'desc',
      },
      take: 20,
    });

    // Calculate budget vs proposal comparisons with best proposal recommendation
    const budgetComparisons = await Promise.all(
      rfpsWithProposalCounts.map(async (rfp) => {
        const proposals = await prisma.proposal.findMany({
          where: { rfpId: rfp.id },
          select: { 
            id: true,
            totalPrice: true, 
            score: true,
            deliveryTime: true,
            vendor: {
              select: {
                name: true,
              }
            }
          },
        });

        const avgProposalPrice = proposals.length > 0
          ? proposals.reduce((sum, p) => sum + (p.totalPrice || 0), 0) / proposals.length
          : 0;

        const minProposalPrice = proposals.length > 0
          ? Math.min(...proposals.map(p => p.totalPrice || 0))
          : 0;

        // Find best proposal by score
        const bestByScore = proposals.length > 0
          ? proposals.reduce((best, current) => 
              (current.score || 0) > (best.score || 0) ? current : best
            )
          : null;

        // Find best by price
        const bestByPrice = proposals.length > 0
          ? proposals.reduce((best, current) => 
              (current.totalPrice || Infinity) < (best.totalPrice || Infinity) ? current : best
            )
          : null;

        return {
          rfpId: rfp.id,
          rfpTitle: rfp.title,
          budget: rfp.budget,
          avgProposalPrice,
          minProposalPrice,
          proposalCount: proposals.length,
          budgetUtilization: rfp.budget > 0 ? (minProposalPrice / rfp.budget) * 100 : 0,
          bestProposal: bestByScore ? {
            id: bestByScore.id,
            vendor: bestByScore.vendor.name,
            price: bestByScore.totalPrice,
            score: bestByScore.score,
            deliveryTime: bestByScore.deliveryTime,
          } : null,
          bestByPrice: bestByPrice ? {
            id: bestByPrice.id,
            vendor: bestByPrice.vendor.name,
            price: bestByPrice.totalPrice,
            deliveryTime: bestByPrice.deliveryTime,
          } : null,
        };
      })
    );

    res.json({
      success: true,
      analytics: {
        overview: {
          totalRFPs,
          totalVendors,
          totalProposals,
          avgProposalsPerRFP: totalRFPs > 0 ? (totalProposals / totalRFPs).toFixed(2) : 0,
        },
        rfpsByStatus: rfpsByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        proposalsByStatus: proposalsByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        proposalStats: {
          average: proposalStats._avg.totalPrice || 0,
          minimum: proposalStats._min.totalPrice || 0,
          maximum: proposalStats._max.totalPrice || 0,
          total: proposalStats._sum.totalPrice || 0,
        },
        rfpsWithProposalCounts,
        vendorPerformance: vendorPerformance.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          category: vendor.category,
          proposalCount: vendor._count.proposals,
        })),
        recentProposals,
        budgetComparisons,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

// Get proposal comparison for specific RFP
const getRFPAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const proposalStats = {
      count: rfp.proposals.length,
      avgPrice: rfp.proposals.length > 0
        ? rfp.proposals.reduce((sum, p) => sum + (p.totalPrice || 0), 0) / rfp.proposals.length
        : 0,
      minPrice: rfp.proposals.length > 0
        ? Math.min(...rfp.proposals.map(p => p.totalPrice || 0))
        : 0,
      maxPrice: rfp.proposals.length > 0
        ? Math.max(...rfp.proposals.map(p => p.totalPrice || 0))
        : 0,
    };

    res.json({
      success: true,
      rfp: {
        ...rfp,
        proposalStats,
      },
    });
  } catch (error) {
    console.error('Error fetching RFP analytics:', error);
    res.status(500).json({ error: 'Failed to fetch RFP analytics' });
  }
};

module.exports = {
  getAnalyticsDashboard,
  getRFPAnalytics,
};
