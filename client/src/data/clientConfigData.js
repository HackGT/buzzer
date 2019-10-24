export default {
    live_site: {
        title: {type:"string"},
        icon: {type:"string"}
    },
    slack: {
        channels: {type:"string-array"},
        at_channel: {type:"boolean"},
        at_here: {type:"boolean"}
    },
    twilio: {
        numbers: {type:"string-array"},
        groups: {type:"string-array"}
    },
    twitter: {
        _: {type:"boolean"}
    },
    f_c_m: {
        header: {type:"string"},
        id: {type:"string"}
    },
    mapgt: {
        area: {
            type: "dropdown",
            cms: "areas",
            value: "mapgt_slug",
            text: "name"
        },
        title: {type:"string"},
        time: {type:"string"}
    }
}
