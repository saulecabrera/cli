module.exports = {
  // This for the alphabetical autogenerated sidebar
  // autoSidebar: [{type: 'autogenerated', dirName: '.'}],

  // Uncomment this if not using the auto sidebar above
  // Uses the docusaurus/docs directory by default as the root of the docs

  // This is an example of what the manual sidebar should look like
  docs: [
    'introduction',
    'architecture',
    'principles',
    'testing-strategy',
    'error-handling',
    'release',
    {
      type: 'category',
      label: 'Decision record',
      collapsible: true,
      collapsed: true,
      items: [{type: 'autogenerated', dirName: 'decision-record'}],
    },
  ],
};
