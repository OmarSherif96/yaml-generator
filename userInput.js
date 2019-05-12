const inquirer = require('inquirer');

let domainName;
let organizationsNumber;
let userAnswers = [];



let networkQuestions = [{
  type: 'string',
  name: 'domainName',
  message: 'Enter your domain name',
  validate: function (value) {
    if (!value) {
      return "Please enter a value"
    }
    domainName = value;
    return true;
  }
},
{
  type: 'number',
  name: 'organizationsNumber',
  message: 'Number of organizations',
  validate: function (value) {
    if (!value) {
      return "Please enter a number"
    }
    else {
      organizationsNumber = value;
      return true;
    }
  }
}

]
let organizationQuestions = [{
  type: 'number',
  name: 'organizationPeers',
  message: 'Number of peers in organization',
  validate: function (value) {
    if (!value) {
      return "Please enter a number"
    }
    else {
      return true;
    }
  }
},
{
  type: 'string',
  name: 'organizationName',
  message: 'Name of Organization',
  validate: function (value) {
    if (!value) {
      return "Please enter a value"
    }

    return true;
  }
},
{
  type: 'string',
  name: 'ordererName',
  message: 'Orderer Name',
  validate: function (value) {
    if (!value) {
      return "Please enter a value"
    }

    return true;
  }
},
{
  type: 'rawlist',
  name: 'databaseName',
  message: 'Database per organization',
  choices: ['couchdb', 'leveldb']
},
]

inquirer.prompt(networkQuestions).then(networkAnswers => {
  let organizationCounter = organizationsNumber;
  function ask() {
    inquirer.prompt(organizationQuestions).then(organizationAnswers => {
      userAnswers.push(organizationAnswers);

      if (organizationCounter > 0) {
        ask();
        console.log(userAnswers);
      }
      else {
        console.log("Done");

      }
    })
    organizationCounter = organizationCounter - 1;
  }
  ask(); 
  domainName = networkAnswers.domainName;
  organizationsNumber = networkAnswers.organizationsNumber;
  module.exports = {
    userAnswers,
    organizationsNumber,
    domainName
  }

}
)







