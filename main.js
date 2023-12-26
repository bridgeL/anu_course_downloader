// ==UserScript==
// @name         anu course downloader
// @namespace    http://tampermonkey.net/
// @version      2023-12-26
// @description  try to take over the world!
// @author       You
// @match        https://wattlecourses.anu.edu.au/course/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anu.edu.au
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    class Downloader {
        async promise_sidebar_open() {
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

        get_all_links(course_name) {
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
                                if (a.innerText) {
                                    links.push({
                                        name: raw.name + " " + a.innerText,
                                        link: a.href
                                    })
                                }
                            });
                    };

                    xhr.send();
                }
            })

            return links;
        }

        async download_link(raw) {
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

        async start(course_name) {
            await this.promise_sidebar_open();
            var links = this.get_all_links(course_name);
            console.log(links);
            if (!confirm(`检测到${links.length}项资源，确定要下载吗？`)) return;
            for (var link of links) {
                await this.download_link(link);
            }
        }
    }

    const downloader = new Downloader();

    class GUI {
        insert_css(css) {
            var style = document.createElement("style");
            style.innerHTML = css;
            document.body.append(style);
        }

        init() {
            var course_name = document.querySelector("#page-navbar li:last-child a").title;
            var originalNode = document.querySelector(".secondary-navigation li:nth-child(1)");
            var clonedNode = originalNode.cloneNode(true);
            originalNode.parentNode.appendChild(clonedNode);

            var a = clonedNode.querySelector("a");
            a.innerText = "Download";
            a.onclick = async (event) => {
                event.preventDefault();
                await downloader.start(course_name);
            };
        }
    }

    const gui = new GUI();
    gui.init();

})();