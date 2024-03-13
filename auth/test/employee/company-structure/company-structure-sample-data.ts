const companyStructureData = {
  type: 'COMPANY',
  name: 'KOI',
  child: [
    {
      type: 'LOCATION',
      name: 'Phnom Penh',
      child: [
        {
          type: 'OUTLET',
          name: 'KOI Thé HQ',
          isHq: true,
          ipAddress: '192.168.2.1',
          child: [
            {
              type: 'DEPARTMENT',
              name: 'Human Resource And Administration',
              child: [
                {
                  type: 'TEAM',
                  name: 'Human Resource And Administration',
                  positions: [
                    {
                      type: 'POSITION',
                      name: 'Chief Human Resource And Administration Officer',
                      levelNumber: 6
                    },
                    {
                      type: 'POSITION',
                      name: 'Head Of Human Resource And Administration Department',
                      levelNumber: 5
                    }
                  ],
                  child: [
                    {
                      type: 'TEAM',
                      name: 'Administration',
                      positions: [
                        {
                          type: 'POSITION',
                          name: 'Administration Manager',
                          levelNumber: 4.2
                        },
                        {
                          type: 'POSITION',
                          name: 'Deputy Administration Manager',
                          levelNumber: 4.1
                        },
                        {
                          type: 'POSITION',
                          name: 'Administration Supervisor',
                          levelNumber: 3
                        },
                        {
                          type: 'POSITION',
                          name: 'Senior Administration Officer',
                          levelNumber: 2.2
                        },
                        {
                          type: 'POSITION',
                          name: 'Administration Officer',
                          levelNumber: 2.1
                        },
                        {
                          type: 'POSITION',
                          name: 'Administration Intern',
                          levelNumber: 0
                        }
                      ]
                    },
                    {
                      type: 'TEAM',
                      name: 'Human Resource',
                      positions: [
                        {
                          type: 'POSITION',
                          name: 'Human Resource Manager',
                          levelNumber: 4.2
                        }
                      ],
                      child: [
                        {
                          type: 'TEAM',
                          name: 'Recruitment And Training',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Deputy Recruitment And Training Manager',
                              levelNumber: 4.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Recruitment And Training Supervisor',
                              levelNumber: 3
                            },
                            {
                              type: 'POSITION',
                              name: 'Senior Recruitment And Training Officer',
                              levelNumber: 2.2
                            },
                            {
                              type: 'POSITION',
                              name: 'Recruitment And Training Officer',
                              levelNumber: 2.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Recruitment And Training Intern',
                              levelNumber: 0
                            }
                          ]
                        },
                        {
                          type: 'TEAM',
                          name: 'Compliance And Employee Relationship',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Deputy Compliance And Employee Relationship Manager',
                              levelNumber: 4.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Compliance And Employee Relationship Supervisor',
                              levelNumber: 3
                            },
                            {
                              type: 'POSITION',
                              name: 'Senior Compliance And Employee Relationship Officer',
                              levelNumber: 2.2
                            },
                            {
                              type: 'POSITION',
                              name: 'Compliance And Employee Relationship Officer',
                              levelNumber: 2.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Compliance And Employee Relationship Intern',
                              levelNumber: 0
                            }
                          ]
                        },
                        {
                          type: 'TEAM',
                          name: 'Time And Attendance, Compensation And Benefit',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Deputy Time And Attendance, Compensation And Benefit Manager',
                              levelNumber: 4.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Time And Attendance, Compensation And Benefit Supervisor',
                              levelNumber: 3
                            }
                          ],
                          child: [
                            {
                              type: 'TEAM',
                              name: 'Compensation And Benefit',
                              positions: [
                                {
                                  type: 'POSITION',
                                  name: 'Senior Compensation And Benefit Officer',
                                  levelNumber: 2.2
                                },
                                {
                                  type: 'POSITION',
                                  name: 'Compensation And Benefit Officer',
                                  levelNumber: 2.1
                                },
                                {
                                  type: 'POSITION',
                                  name: 'Compensation And Benefit Intern',
                                  levelNumber: 0
                                }
                              ]
                            },
                            {
                              type: 'TEAM',
                              name: 'Time And Attendance',
                              positions: [
                                {
                                  type: 'POSITION',
                                  name: 'Senior Time And Attendance Officer',
                                  levelNumber: 2.2
                                },
                                {
                                  type: 'POSITION',
                                  name: 'Time And Attendance Officer',
                                  levelNumber: 2.1
                                },
                                {
                                  type: 'POSITION',
                                  name: 'Time And Attendance Intern',
                                  levelNumber: 0
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'DEPARTMENT',
              name: 'Executive'
            },
            {
              type: 'DEPARTMENT',
              name: 'Marketing And Branding'
            },
            {
              type: 'DEPARTMENT',
              name: 'Finance And Accounting'
            },
            {
              type: 'DEPARTMENT',
              name: 'Supply Chain'
            },
            {
              type: 'DEPARTMENT',
              name: 'Warehouse And Logistic'
            },
            {
              type: 'DEPARTMENT',
              name: 'Information Technology And Development'
            },
            {
              type: 'DEPARTMENT',
              name: 'Construction And Maintenance'
            },
            {
              type: 'DEPARTMENT',
              name: 'Creative'
            },
            {
              type: 'DEPARTMENT',
              name: 'Operation',
              child: [
                {
                  type: 'TEAM',
                  name: 'Operation',
                  positions: [
                    {
                      type: 'POSITION',
                      name: 'Chief Operation Officer',
                      levelNumber: 6
                    },
                    {
                      type: 'POSITION',
                      name: 'Head Of Operation Department',
                      levelNumber: 5
                    }
                  ],
                  child: [
                    {
                      type: 'TEAM',
                      name: 'Operation Manager',
                      positions: [
                        {
                          type: 'POSITION',
                          name: 'Operation Manager',
                          levelNumber: 4.2
                        },
                        {
                          type: 'POSITION',
                          name: 'Area Manager',
                          levelNumber: 4.1
                        },
                        {
                          type: 'POSITION',
                          name: 'Store Manager',
                          levelNumber: 3
                        },
                        {
                          type: 'POSITION',
                          name: 'Assistant Store Manager',
                          levelNumber: 2.2
                        }
                      ],
                      child: [
                        {
                          type: 'TEAM',
                          name: 'Supervisor',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Supervisor',
                              levelNumber: 2.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Service Crew',
                              levelNumber: 1
                            }
                          ]
                        },
                        {
                          type: 'TEAM',
                          name: 'Outdoor Service Supervisor',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Outdoor Service Supervisor',
                              levelNumber: 2.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Outdoor Service',
                              levelNumber: 1
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 'TEAM',
                      name: 'Quality Control And Examination',
                      positions: [
                        {
                          type: 'POSITION',
                          name: 'Quality Control And Examination Manager',
                          levelNumber: 4.2
                        },
                        {
                          type: 'POSITION',
                          name: 'Deputy Quality Control And Examination Manager',
                          levelNumber: 4.1
                        },
                        {
                          type: 'POSITION',
                          name: 'Quality Control And Examination Supervisor',
                          levelNumber: 3
                        }
                      ],
                      child: [
                        {
                          type: 'TEAM',
                          name: 'Quality Control',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Senior Quality Control Officer',
                              levelNumber: 2.2
                            },
                            {
                              type: 'POSITION',
                              name: 'Quality Control Officer',
                              levelNumber: 2.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Quality Control Intern',
                              levelNumber: 0
                            }
                          ]
                        },
                        {
                          type: 'TEAM',
                          name: 'Examination',
                          positions: [
                            {
                              type: 'POSITION',
                              name: 'Senior Examination Officer',
                              levelNumber: 2.2
                            },
                            {
                              type: 'POSITION',
                              name: 'Examination Officer',
                              levelNumber: 2.1
                            },
                            {
                              type: 'POSITION',
                              name: 'Examination Intern',
                              levelNumber: 0
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'OUTLET',
          name: 'KOI Thé PTP',
          ipAddress: '192.168.2.2'
        }
      ]
    },
    {
      type: 'LOCATION',
      name: 'Kandal',
      child: [
        {
          type: 'OUTLET',
          name: 'KOI Thé TKM',
          ipAddress: '192.168.2.3'
        }
      ]
    },
    {
      type: 'LOCATION',
      name: 'Siem Reap',
      child: [
        {
          type: 'OUTLET',
          name: 'KOI Thé SHW',
          ipAddress: '192.168.2.4'
        },
        {
          type: 'OUTLET',
          name: 'KOI Thé SRL',
          ipAddress: '192.168.2.5'
        }
      ]
    }
  ]
};

export { companyStructureData };
