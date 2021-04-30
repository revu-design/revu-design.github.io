import WebComponent from "/web-component/web-component.js"

endpoints = {
    "br": {
        lambda: "https://f4do7hzoab.execute-api.sa-east-1.amazonaws.com/default/ec-management",
        domain: "br.ps.revu.design"
    },
    "uk": {
        lambda: "https://nyfoadnk5k.execute-api.eu-west-2.amazonaws.com/default/ec-management",
        domain: "uk.ps.revu.design"
    }
}

let region = new URLSearchParams(window.location.search).get("region") || "uk";
let endpoint = endpoints[region];

console.log(`Region: ${region}`)

let expectedLoadingTime = 20000; // 20 seconds.

export default class WebRevu extends WebComponent {
    onStarted() {
        let iframe = this.root.getElementById("iframe");
        let loading = this.root.getElementById("loading");
        iframe.src = `https://${endpoint.domain}`;
        iframe.classList.remove("hidden");
        loading.classList.add("hidden");
    }

    async exec(command) {
        console.log(`Executing: ${command}`);
        let response = await fetch(endpoint.lambda, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });
        let text = await response.text();
        console.log(`Response: ${text}`);
    }

    startInstance() {
        this.exec("Start");
        this.ws = new WebSocket(`wss://${endpoint.domain}`);
        this.ws.onopen = (function(revu) {
            return function() {
                revu.ws.close();
                revu.ws = null;
                revu.onStarted();
            }
        })(this);

        this.ws.onerror = (function(revu) {
            return function() {
                setTimeout((function(revu) {
                    return function() {
                        revu.startInstance(); // We try again.
                    }
                })(revu), 1000);
            }
        })(this);
    }

    async onload(root) {
        this.root = root;
        this.startInstance();
    }
}
