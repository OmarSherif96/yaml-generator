const json2yaml = require('json2yaml')
const fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, 'docker-compose-e2e-template.yaml')

let jsonFile;
//Input to the generator
let organizationsNumber = 3;
let organizationsNames = ["a", "b", "c"]
let organizationsPeers = [2, 2, 3]
//JSON values converted from YAML
let volumes = {
  "version": "2",
  "volumes": {
    "orderer.domain.com": null,
  }
}
let caValue = {
  "image": "hyperledger/fabric-ca:1.4",
  "environment": [
    "FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server",
    "FABRIC_CA_SERVER_CA_NAME=ca-org",
    "FABRIC_CA_SERVER_TLS_ENABLED=true",
    "FABRIC_CA_SERVER_TLS_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.org.domain.com-cert.pem",
    "FABRIC_CA_SERVER_TLS_KEYFILE=/etc/hyperledger/fabric-ca-server-config/CA1_PRIVATE_KEY"
  ],
  "ports": [
    "7054:7054"
  ],
  "command": "sh -c 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca.org.domain.com-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/CA1_PRIVATE_KEY -b admin:adminpw -d'",
  "volumes": [
    "./crypto-config/peerOrganizations/org.domain.com/ca/:/etc/hyperledger/fabric-ca-server-config"
  ],
  "container_name": "ca_peerorg",
  "networks": [
    "byfn"
  ]
}
let networks = {
  "networks": {
    "byfn": null
  },
  "services": {
  }
}
let peerContainer = {
  "container_name": "peer.org.domain.com",
  "image": "hyperledger/fabric-peer:1.4",
  "environment": [
    "CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock",
    "CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_byfn",
    "FABRIC_LOGGING_SPEC=INFO",
    "CORE_PEER_TLS_ENABLED=true",
    "CORE_PEER_GOSSIP_USELEADERELECTION=true",
    "CORE_PEER_GOSSIP_ORGLEADER=false",
    "CORE_PEER_PROFILE_ENABLED=true",
    "CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt",
    "CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key",
    "CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt",
    "CORE_PEER_ID=peer.org.domain.com",
    "CORE_PEER_ADDRESS=peer.org.domain.com:7051",
    "CORE_PEER_LISTENADDRESS=0.0.0.0:7051",
    "CORE_PEER_CHAINCODEADDRESS=peer.org.domain.com:7052",
    "CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052",
    "CORE_PEER_GOSSIP_BOOTSTRAP=peer.org.domain.com:8051",
    "CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer.org.domain.com:7051",
    "CORE_PEER_LOCALMSPID=orgMSP"
  ],
  "working_dir": "/opt/gopath/src/github.com/hyperledger/fabric/peer",
  "command": "peer node start",
  "volumes": [
    "/var/run/:/host/var/run/",
    "../crypto-config/peerOrganizations/org.domain.com/peers/peer.org.domain.com/msp:/etc/hyperledger/fabric/msp",
    "../crypto-config/peerOrganizations/org.domain.com/peers/peer.org.domain.com/tls:/etc/hyperledger/fabric/tls",
    "peer.org.domain.com:/var/hyperledger/production"
  ],
  "ports": [
    "7051:7051"
  ],
  "networks": [
    "byfn"
  ]
}

//Replacing Domain with user input domain
//   let volumesString = JSON.stringify(volumes).replace(/domain/g,'omar')
//   volumes=JSON.parse(volumesString)

//Adding peers to volumes json object
for (i = 0; i < organizationsNumber; i++) {
  for (j = 0; j < organizationsPeers[i]; j++) {
    let newPorts = 7051 + i * 1000;
    let portsEdited = newPorts.toString().concat(":").concat(newPorts.toString())
    volumes.volumes['peer' + j + '.' + organizationsNames[i] + '.' + 'omar' + '.com'] = null;
    peerContainer.container_name="peer"+j.toString()+"."+organizationsNames[i]+"domain"+"."+"com"
    peerContainer.ports=portsEdited
    peerContainer.environment['CORE_PEER_CHAINCODELISTENADDRESS']="0"+"."+"0"+"."+"0"+"."+"0"+"."+(newPorts+1).toString()
    peerContainer.environment['CORE_PEER_CHAINCODEADDRESS']="peer"+j.toString()+"."+organizationsNames[i]+"domain"+"."+"com"+":"+newPorts.toString()
  }
}
//


for (i = 0; i < organizationsNumber; i++) {
  let newPorts = 7054 + i * 1000;
  let portsEdited = newPorts.toString().concat(":").concat(newPorts.toString())
  caValue.ports = portsEdited
  console.log(caValue);
  networks.services['ca' + i] = caValue;

}

//Replacing Domain with user input domain
  let volumesString = JSON.stringify(volumes).replace(/domain/g,'omar')
  volumes=JSON.parse(volumesString)

//Adding content together
jsonFile = json2yaml.stringify(volumes).concat(json2yaml.stringify(networks));
// console.log(json2yaml.stringify(volumes).concat(json2yaml.stringify(networks)));




fs.writeFile(filePath, jsonFile, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 


