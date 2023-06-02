const scrappingDetails = [
  {
    statLabel: "Points",
    API_endpoint: 76,
  },
  {
    statLabel: "Tries",
    API_endpoint: 38,
  },
  {
    statLabel: "Goals",
    API_endpoint: 1000034,
  },
  {
    statLabel: "Linebreaks",
    API_endpoint: 30,
  },
  {
    statLabel: "Post Contact Metres",
    API_endpoint: 1000112,
  },
  {
    statLabel: "Line Engaged",
    API_endpoint: 1000025,
  },
  {
    statLabel: "Tackle Breaks",
    API_endpoint: 29,
  },
  {
    statLabel: "Try Assists",
    API_endpoint: 35,
  },
  {
    statLabel: "Offloads",
    API_endpoint: 28,
  },
  {
    statLabel: "Linebreak Assists",
    API_endpoint: 31,
  },
  {
    statLabel: "All Receipts",
    API_endpoint: 1000028,
  },
  {
    statLabel: "Conversions",
    API_endpoint: 1000209,
  },
  {
    statLabel: "Kick Metres",
    API_endpoint: 32,
  },
  {
    statLabel: "All Kicks",
    API_endpoint: 33,
  },
  {
    statLabel: "40/20",
    API_endpoint: 82,
  },
  {
    statLabel: "Tackles",
    API_endpoint: 3,
  },
  {
    statLabel: "Missed Tackles",
    API_endpoint: 4,
  },
  {
    statLabel: "Charge Downs",
    API_endpoint: 1000000,
  },
  {
    statLabel: "All Runs",
    API_endpoint: 1000038,
  },
  {
    statLabel: "Run Metres",
    API_endpoint: 1000037,
  },
  {
    statLabel: "Dummy Half Runs",
    API_endpoint: 81,
  },
  {
    statLabel: "Kick Return Metres",
    API_endpoint: 78,
  },
  {
    statLabel: "Errors",
    API_endpoint: 37,
  },
  {
    statLabel: "Penalties",
    API_endpoint: 1000026,
  },
  {
    statLabel: "Handling Errors",
    API_endpoint: 1000079,
  },
  {
    statLabel: "Ineffective Tackles",
    API_endpoint: 1000003,
  },
  {
    statLabel: "Player in Support",
    API_endpoint: 1000015,
  },
  {
    statLabel: "Decoy Runs",
    API_endpoint: 1000002,
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
