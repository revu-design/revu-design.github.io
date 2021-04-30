import WebComponent from "/web-component/web-component.js"

let endpoint = "https://f4do7hzoab.execute-api.sa-east-1.amazonaws.com/default/ec-management"
let domain = "br.ps.revu.design";
let expectedLoadingTime = 20000; // 20 seconds.

export default class WebRevu extends WebComponent {
    onStarted() {
        let iframe = this.root.getElementById("iframe");
        let loading = this.root.getElementById("loading");
        iframe.src = `https://${domain}`;
        iframe.classList.remove("hidden");
        loading.classList.add("hidden");
    }

    async exec(command) {
        console.log(`Executing: ${command}`);
        let response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });
        let text = await response.text();
        console.log(`Response: ${text}`);
    }

    startInstance() {
        this.exec("Start");
        this.ws = new WebSocket(`wss://${domain}`);
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

        setTimeout((function(revu) {
            return function() {
                revu.onStarted()
            }
        })(this), expectedLoadingTime);
    }
}
