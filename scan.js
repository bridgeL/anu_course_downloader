// await(async function () {


const WIDTH = 240;
const HEIGHT = 60;
const items = [];

var main_div = document.createElement("div");
document.body.appendChild(main_div);
main_div.style = `    
    position: absolute;
    z-index: 1000;
    height: calc(100vh - 20px);
    width: calc(100vw - 20px);
    background-color: white;
    top: 0px;
    left: 0px;
    padding: 10px;
    display: none;
    `;

const create_grid_div = () => {
    var back_div = document.createElement("div");
    main_div.appendChild(back_div);
    back_div.style = "position: absolute;";

    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 5; j++) {
            var div = document.createElement("div");
            div.style = `
    display: block;     
    border-bottom: #bbb dashed 2px;
    border-right: #bbb dashed 2px;
    position: absolute;
    color: #bbb;
    white-space:pre-wrap;
    `;
            if (i == 0) div.style.borderTop = "#bbb dashed 2px";
            if (j == 0) div.style.borderLeft = "#bbb dashed 2px";
            if (i % 2 == 0) div.innerHTML = "  " + (i / 2 + 8) + ":00";
            div.style.width = WIDTH + "px";
            div.style.height = HEIGHT / 2 + "px";
            div.style.left = j * WIDTH + "px";
            div.style.top = i * HEIGHT / 2 + "px";
            back_div.appendChild(div);
        }
    }

}

const create_item_div = () => {
    var item_div = document.createElement("div");
    main_div.appendChild(item_div);
    item_div.style = "position: absolute;";

    items.forEach(item => {
        item.el = document.createElement("div");
        item_div.appendChild(item.el);

        item.el.data = item;
        item.el.innerHTML = item.group + " " + item.code;
        item.el.title = item.title;
        item.el.style = "position: absolute; margin: 2px; cursor: pointer; user-select: none; font-size: 14px; display: block; opacity: 0.7;";
        item.el.style.top = (item.start / 60 - 8) * HEIGHT + "px";
        item.el.style.left = (item.weekday - 1) * WIDTH + "px";
        item.el.style.height = (item.end - item.start) / 60 * HEIGHT - 4 + "px";
        item.el.style.width = WIDTH - 4 + "px";
        item.el.style.backgroundColor = item.color;

        item.el.addEventListener("click", event => {
            event.preventDefault();
            var el = event.target;
            var s = el.data.course + el.data.group;
            var _items = items.filter(item => item.course + item.group == s);

            if (el.data.show == 2) _items.forEach(item => item.show = 1);
            else {
                _items.forEach(item => item.show = 0);
                el.data.show = 2;
            }

            show();
        });

        item.el.addEventListener("mouseenter", event => {
            event.preventDefault();
            var el = event.target;
            var s = el.data.course + el.data.group;
            items.filter(item => item.course + item.group == s)
                .forEach(item => item.el.style.textDecorationLine = "underline");
            el.style.zIndex = 2000;
            el.style.opacity = 1;
        });

        item.el.addEventListener("mouseleave", event => {
            event.preventDefault();
            var el = event.target;
            var s = el.data.course + el.data.group;
            items.filter(item => item.course + item.group == s)
                .forEach(item => item.el.style.textDecorationLine = "");
            el.style.zIndex = "";
            el.style.opacity = el.data.show == 2 ? 1 : 0.7;
        });

        item.el.addEventListener("contextmenu", event => {
            event.preventDefault();
            var el = event.target;
            if (el.data.show == 1) el.data.show = 0;
            show();
        })
    })
}

const check_conflict = (d1, d2) => {
    if (d1.weekday != d2.weekday) return false;
    if (d1.end <= d2.start || d2.end <= d1.start) return false;
    return true;
}

const show = () => {

    items.filter(item => item.show == 0).forEach(item => item.el.style.display = "none");

    var _items = items.filter(item => item.show > 0);
    _items.forEach(item => {
        item.el.style.display = "";
        item.conflict = 0;
        item.ci = 0;
    });

    _items.forEach(item => {
        _items.forEach(item2 => {
            if (check_conflict(item, item2)) {
                item.conflict += 1;
                if (item2.id > item.id) item2.ci += 1;
            }
        })
    })

    _items.forEach(item => {
        var d = WIDTH / item.conflict;
        item.el.style.width = d - 4 + "px";
        item.el.style.left = (item.weekday - 1) * WIDTH + d * item.ci + "px";
        item.el.style.opacity = item.show == 2 ? 1 : 0.7;
        item.el.style.fontWeight = item.show == 2 ? "bold" : "";

    })
}

const get_items = async () => {
    const delay = async (ms) => {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        })
    }

    const time2int = (time) => {
        var i = time.indexOf(":");
        return parseInt(time.substring(0, i)) * 60 + parseInt(time.substring(i + 1));
    }

    const week2int = (week) => {
        if (week == "Mon") return 1;
        if (week == "Tue") return 2;
        if (week == "Wed") return 3;
        if (week == "Thu") return 4;
        if (week == "Fri") return 5;
        return 0;
    }

    const get_desc = (desc) => {
        var i = desc.indexOf("(Class");
        return desc.substring(0, i).trim();
    }

    const get_color = (i, j) => {
        var colors = [[
            "#FF5733",
            "#FF8C66",
            "#FFB099",
            "#FFD4CC",
            "#FFE8E2",
        ], [
            "#2ECC71",
            "#53E084",
            "#7BE397",
            "#A4F0AB",
            "#C1F7BF",
        ], [
            "#3498DB",
            "#5BADEA",
            "#7CC2F3",
            "#A3D5F9",
            "#BADFFC",
        ], [
            "#F39C12",
            "#F8B84A",
            "#FAC06B",
            "#FCCD92",
            "#FEDBAF",
        ]];
        return colors[i % 4][j % 4];
    }

    const click_all = async () => {
        // click all button to load all data
        var elements = Array.from(document.querySelectorAll("li.action > a"));
        for (var el of elements) {
            el.click();
            await delay(1000);
        }
    }

    await click_all();

    // data : global variable
    var temp = data["student"]["student_enrolment"];
    var _items = [];
    var id = 0;
    var m = 0;
    var n = 0;

    for (var course_code in temp) {
        var course_name = get_desc(temp[course_code]["description"]);
        var course_groups = temp[course_code]["groups"];

        for (var group_name in course_groups) {
            var group_activities = course_groups[group_name]["activities"]

            for (var activity_name in group_activities) {
                var activity = group_activities[activity_name];

                var start_time = time2int(activity["start_time"]);
                var end_time = start_time + parseInt(activity["duration"]);
                var title = course_name + " " + group_name + " " + activity["activity_code"] + " " + activity["start_time"] + " " + activity["duration"] + "min";

                var item = {
                    "name": course_name,

                    "course": course_code,
                    "group": group_name,
                    "code": activity["activity_code"],

                    "start": start_time,
                    "end": end_time,
                    "weekday": week2int(activity["day_of_week"]),

                    "el": null,
                    "id": id,
                    "color": get_color(m, n),
                    "title": title,
                    "show": 1,
                }

                _items.push(item);
                id += 1;
            }

            n += 1;
        }
        m += 1;
    }

    _items.forEach(item => items.push(item));
}

const create_btns = () => {
    var btn = document.createElement("button");
    btn.innerHTML = "RESET";
    btn.style = "padding: 10px; right: 20px; top: 20px; position: absolute;";
    main_div.append(btn);
    btn.addEventListener("click", event => {
        items.forEach(item => item.show = 1);
        show();
    })

    var btn2 = document.createElement("button");
    btn2.innerHTML = "CLOSE";
    btn2.style = "padding: 10px; right: 20px; top: 80px; position: absolute;";
    main_div.append(btn2);
    btn2.addEventListener("click", event => {
        main_div.style.display = "none";
    })

    var btn3 = document.createElement("button");
    btn3.innerHTML = "AUTO HIDE";
    btn3.title = "auto hide tutorial which is conflict to lecture"
    btn3.style = "padding: 10px; right: 20px; top: 140px; position: absolute;";
    main_div.append(btn3);
    btn3.addEventListener("click", event => {
        var items1 = items.filter(item => item.group.indexOf("Lec") == 0);
        var items2 = items.filter(item => item.group.indexOf("Lec") != 0);
        items2.forEach(i2 => {
            for (var i1 of items1) {
                if (check_conflict(i1, i2)) {
                    i2.show = 0;
                    return;
                }
            }
        });
        show();
    })

    var btn10 = document.createElement("button");
    btn10.innerHTML = "SCAN";
    btn10.style = "padding: 10px; right: 20px; top: 20px; position: absolute;";
    document.body.append(btn10);
    btn10.addEventListener("click", start);
}

const start = async () => {
    await get_items();
    create_item_div();
    show();
    reopen();

    var btn11 = document.createElement("button");
    btn11.innerHTML = "REOPEN";
    btn11.style = "padding: 10px; right: 20px; top: 80px; position: absolute;";
    document.body.append(btn11);
    btn11.addEventListener("click", reopen);
}

const reopen = () => {
    main_div.style.display = "";
}

create_btns();
create_grid_div();

// })();