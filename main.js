class Downloader {
    promise_sidebar_open = async () => {
        return new Promise((resolve, reject) => {
            var sidebar = document.querySelector("#theme_anu-drawers-courseindex");
            var div = sidebar.querySelectorAll("a.courseindex-link.text-truncate")[0];
            if (!div.innerText) {
                var btn = document.querySelector("#topofscroll .btn.icon-no-margin");
                btn.click();
                setTimeout(resolve, 1000);
            }
            else resolve();
        })
    }

    get_all_links = (course_name) => {
        var sidebar = document.querySelector("#theme_anu-drawers-courseindex");
        var raws = Array.from(sidebar.querySelectorAll("a.courseindex-link.text-truncate"))
            .map(a => {
                return {
                    name: course_name + " " + a.innerText,
                    link: a.href
                }
            });

        var links = [];
        raws.forEach(raw => {
            if (raw.link.startsWith("https://wattlecourses.anu.edu.au/mod/resource")) {
                links.push(raw);
            }
            else if (raw.link.startsWith("https://wattlecourses.anu.edu.au/mod/assign")) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', raw.link, true);
                xhr.responseType = "document";

                xhr.onload = function () {
                    Array.from(xhr.responseXML.querySelectorAll(".fileuploadsubmission a"))
                        .forEach(a => {
                            links.push({
                                name: raw.name + " " + a.innerText,
                                link: a.href
                            })
                        });
                };

                xhr.send();
            }
        })

        return links;
    }

    download_link = async (raw) => {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', raw.link, true);
            xhr.responseType = 'blob';

            xhr.onload = function () {
                var a = document.createElement('a');
                a.href = window.URL.createObjectURL(xhr.response);
                a.download = raw.name;
                a.click();
            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    console.log(raw.name + " download successful!");
                    setTimeout(resolve, 1000);
                }
            };

            xhr.send();
        })
    }

    start = async (course_name) => {
        await this.promise_sidebar_open();
        var links = this.get_all_links(course_name);
        console.log(links);
        for (var link of links) {
            await this.download_link(link);
        }
    }
}

const downloader = new Downloader();

class GUI {
    insert_css = (css) => {
        var style = document.createElement("style");
        style.innerHTML = css;
        document.body.append(style);
    }
    init = () => {
        var btn = document.createElement("button");
        btn.innerHTML = "点我下载全部";
        var course_name = document.querySelector("#page-navbar li:last-child a").title;
        btn.onclick = async () => {
            await downloader.start(course_name);
        }
        btn.className = "anu-course-downloader";
        this.insert_css(`
button.anu-course-downloader{
    position:fixed;
    top:50vh;
    left:50vw;
    font-size:20px;
}
        `);
        document.body.append(btn);
    }
}

const gui = new GUI();
gui.init();


