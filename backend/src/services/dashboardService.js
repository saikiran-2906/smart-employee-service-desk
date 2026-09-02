const dashboardRepository = require('../repositories/dashboardRepository');

// Turns rows like [{label, count}] into a simple { label: count } map,
// guaranteeing every expected key is present (defaulting to 0).
function toMap(rows, expectedKeys = []) {
  const map = {};
  expectedKeys.forEach((k) => { map[k] = 0; });
  rows.forEach((r) => { map[r.label] = Number(r.count); });
  return map;
}

const { PRIORITIES, STATUSES } = require('../utils/constants');

const dashboardService = {
  // Admin sees stats scoped to their own department; Support sees only their
  // assigned tickets' stats; Employee sees only stats for tickets they raised.
  async getSummary(currentUser) {
    let scope = null;
    if (currentUser.role === 'Support') {
      scope = { column: 'assigned_to', value: currentUser.user_id };
    } else if (currentUser.role === 'Employee') {
      scope = { column: 'created_by', value: currentUser.user_id };
    } else if (currentUser.role === 'Admin') {
      scope = { column: 'category_id', value: currentUser.department_id };
    }

    const [total, byStatus, byPriority, byCategory] = await Promise.all([
      dashboardRepository.getTotals(scope),
      dashboardRepository.countByStatus(scope),
      dashboardRepository.countByPriority(scope),
      dashboardRepository.countByCategory(scope),
    ]);

    return {
      totalTickets: Number(total),
      byStatus: toMap(byStatus, STATUSES),
      byPriority: toMap(byPriority, PRIORITIES),
      byCategory: byCategory.map((r) => ({ category: r.label, count: Number(r.count) })),
    };
  },
};

module.exports = dashboardService;
