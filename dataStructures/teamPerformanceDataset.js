const scrappingDetails = [
  {
    statLabel: "Points",
    API_endpoint: 76,
  },
  {
    statLabel: "Goals",
    API_endpoint: 1000034,
  },
  {
    statLabel: "Possession",
    API_endpoint: 9,
  },
  {
    statLabel: "Supports",
    API_endpoint: 1000015,
  },
  {
    statLabel: "Linebreaks",
    API_endpoint: 30,
  },
  {
    statLabel: "Tackle Breaks",
    API_endpoint: 29,
  },
  {
    statLabel: "All Run Metres",
    API_endpoint: 1000037,
  },
  {
    statLabel: "Kick Return Metres",
    API_endpoint: 78,
  },
  {
    statLabel: "Offloads",
    API_endpoint: 28,
  },
  {
    statLabel: "Line Break Assists",
    API_endpoint: 31,
  },
  {
    statLabel: "Charge Downs",
    API_endpoint: 1000000,
  },
  {
    statLabel: "Tackles",
    API_endpoint: 3,
  },
  {
    statLabel: "Total Kicks",
    API_endpoint: 33,
  },
  {
    statLabel: "Conversion",
    API_endpoint: 1000209,
  },
  {
    statLabel: "Errors",
    API_endpoint: 37,
  },
  {
    statLabel: "Penalties Conceded",
    API_endpoint: 1000026,
  },
  {
    statLabel: "Tries",
    API_endpoint: 38,
  },
  {
    statLabel: "Field Goals",
    API_endpoint: 69,
  },
  {
    statLabel: "Set Completion",
    API_endpoint: 1000210,
  },
  {
    statLabel: "Line Engaged",
    API_endpoint: 1000025,
  },
  {
    statLabel: "Post Contact Metres",
    API_endpoint: 1000112,
  },
  {
    statLabel: "Decoy Runs",
    API_endpoint: 1000002,
  },
  {
    statLabel: "All Runs",
    API_endpoint: 1000038,
  },
  {
    statLabel: "Dummy Half Runs",
    API_endpoint: 81,
  },
  {
    statLabel: "Try Assists",
    API_endpoint: 35,
  },
  {
    statLabel: "All Receipts",
    API_endpoint: 1000028,
  },
  {
    statLabel: "Missed Tackles",
    API_endpoint: 4,
  },

  {
    statLabel: "Total Kick Metres",
    API_endpoint: 32,
  },

  {
    statLabel: "Ineffective Tackles",
    API_endpoint: 1000003,
  },
  {
    statLabel: "Handling Errors",
    API_endpoint: 1000079,
  },
];

function createDatabase() {
  const data = {};
  for (let season = 2018; season < new Date().getFullYear(); season++) {
    data[season] = {};
    for (stat of scrappingDetails) {
      data[season][stat.statLabel] = null;
    }
  }

  return data;
}

module.exports = {
  scrappingDetails: scrappingDetails,
  createDatabase: createDatabase,
};
