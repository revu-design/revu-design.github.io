import WebComponent from "/web-component/web-component.js"

let endpoint = "https://f4do7hzoab.execute-api.sa-east-1.amazonaws.com/default/ec-management"
let expectedLoadingTime = 20000; // 20 seconds.

export default class WebRevu extends WebComponent {
    onStarted() {
        let iframe = this.root.getElementById("iframe");
        let loading = this.root.getElementById("loading");
        iframe.src = "https://ps.revu.design";
        iframe.classList.remove("hidden");
        loading.classList.add("hidden");
    }

    async exec(command) {
        let response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });
        let text = await response.text();
        console.log(`Response: ${text}`);
    }

    async onload(root) {
        this.root = root;
        console.log("Starting");
        exec("Start");
        setTimeout((function(revu) {
            return function() {
                revu.onStarted()
            }
        })(this), expectedLoadingTime);
    }
}
