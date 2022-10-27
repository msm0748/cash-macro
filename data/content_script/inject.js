if (!background) {
    var background = (function () {
        var tmp = {};
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            for (var id in tmp) {
                if (tmp[id] && typeof tmp[id] === "function") {
                    if (request.path == "background-to-page") {
                        if (request.method === id) tmp[id](request.data);
                    }
                }
            }
        });
        /*  */
        return {
            receive: function (id, callback) {
                tmp[id] = callback;
            },
            send: function (id, data) {
                chrome.runtime.sendMessage({ path: "page-to-background", method: id, data: data });
            },
        };
    })();

    var config = {
        ruler: {
            x: null,
            y: null,
            element: {},
            width: null,
            height: null,
            action: true,
            active: true,
            status: false,
            current: { x: null, y: null },
            build: function () {
                config.ruler.element.rect = document.createElement("div");
                config.ruler.element.container = document.createElement("div");
                /*  */
                config.ruler.element.rect.className = "ruler-mode-rectangle";
                config.ruler.element.container.className = "ruler-mode-container";
                /*  */
                document.body.appendChild(config.ruler.element.container);
                document.body.appendChild(config.ruler.element.rect);
            },
            info: {
                remove: function () {
                    var target = document.querySelector(".ruler-mode-info");
                    if (target) target.remove();
                },
                add: function () {
                    config.ruler.element.info = document.createElement("div");
                    /*  */
                    config.ruler.element.info.textContent = "Ruler mode...";
                    config.ruler.element.info.className = "ruler-mode-info";
                    document.body.appendChild(config.ruler.element.info);
                },
            },
            keydown: function (e) {
                e.stopPropagation();
                if (e.cancelable) e.preventDefault();
                /*  */
                if (e.key === "Escape") background.send("escape", { state: "OFF" });
            },
            hide: function () {
                config.ruler.info.remove();
                /*  */
                if (config.ruler.element.rect) config.ruler.element.rect.remove();
                if (config.ruler.element.container) config.ruler.element.container.remove();
                if (config.ruler.element.alert) config.ruler.element.alert.remove();
                /*  */
                document.removeEventListener("mouseup", config.ruler.input.end);
                document.removeEventListener("mousemove", config.ruler.input.move);
                /*  */
                document.removeEventListener("touchend", config.ruler.input.end);
                document.removeEventListener("touchmove", config.ruler.input.move);
                /*  */
                document.documentElement.removeAttribute("ruler-mode");
                document.removeEventListener("keydown", config.ruler.keydown);
            },
            show: function () {
                var target = document.querySelector(".ruler-mode-container");
                if (!target) {
                    config.ruler.build();
                    config.ruler.info.add();
                    /*  */
                    document.addEventListener("mouseup", config.ruler.input.end);
                    document.addEventListener("mousemove", config.ruler.input.move);
                    /*  */
                    document.addEventListener("touchend", config.ruler.input.end);
                    document.addEventListener("touchmove", config.ruler.input.move);
                    /*  */
                    document.documentElement.setAttribute("ruler-mode", "");
                    document.addEventListener("keydown", config.ruler.keydown);
                }
            },
            input: {
                end: function (e) {
                    if (e.cancelable) e.preventDefault();
                    /*  */
                    window.navigator.clipboard.writeText(`${e.pageX}, ${e.pageY}`).then(() => {
                        // 복사가 완료되면 호출된다.
                        config.ruler.element.alert = document.createElement("div");
                        config.ruler.element.alert.className = "ruler-mode-alert";
                        config.ruler.element.alert.textContent = "복사완료";
                        document.body.appendChild(config.ruler.element.alert);
                        setTimeout(function () {
                            config.ruler.element.alert.remove();
                        }, 2000);
                    });
                },
                move: function (e) {
                    if (e.cancelable) e.preventDefault();
                    /*  */
                    var action =
                        e.type === "keydown" ||
                        (config.ruler.active && (e.type === "touchmove" || e.type === "mousemove"));
                    if (action) {
                        if (config.ruler.element.rect) {
                            var top = e.pageY;
                            var left = e.pageX;
                            /*  */
                            config.ruler.element.rect.textContent = `${left}, ${top}`;
                            config.ruler.element.rect.style.top = top + "px";
                            config.ruler.element.rect.style.left = left + "px";
                            config.ruler.element.rect.style.width = 100 + "px";
                            config.ruler.element.rect.style.height = 40 + "px";
                            config.ruler.element.rect.style.borderWidth = "1px";
                            /*  */
                        }
                    }
                },
            },
        },
    };
    //
    background.receive("ruler-mode", function (e) {
        config.ruler[e.state === "ON" ? "show" : "hide"]();
    });
}
