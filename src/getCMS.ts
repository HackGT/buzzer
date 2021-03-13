import fetch from "node-fetch";

const moment = require("moment-timezone");

const eventBasics = `
	eventbases(start: 0) {
		title
		points
		start_time
		end_time
		checkin_slug
		area {
			name
		}
		type
	}
`;

const getCMSData = async queryString =>
  fetch("https://cms.hack.gt/graphql", {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
      "Accept": `application/json`,
    },
    body: JSON.stringify({
      query: `query {
				${queryString}
			}`,
    }),
  })
    .then(r => r.json())
    .catch(err => {
      console.error(err);
      return false;
    });

const eToSlug = e => {
  if (e.checkin_slug) return e.checkin_slug;
  const base = e.title.toLowerCase().replace(/[\s-]+/g, "_");
  if (!e.area || !e.area.name) return base;
  const areaClean = e.area.name.toLowerCase().replace(/[\s-]+/g, "_");
  return `${base}_${areaClean}`;
};

const UNSAFE_parseAsLocal = t => {
  // parse iso-formatted string as local time
  let localString = t;
  if (t.slice(-1).toLowerCase() === "z") {
    localString = t.slice(0, -1);
  }
  return moment(localString);
};

const UNSAFE_toUTC = t => UNSAFE_parseAsLocal(t).utc();

getCMSData(eventBasics)
  .then(result => {
    const info = result.data.eventbases;
    const checkinInfo = info.map(e => {
      const tag = eToSlug(e);
      const startTime = UNSAFE_toUTC(e.start_time).format();
      const endTime = UNSAFE_toUTC(e.end_time).format();
      const shouldWarn = e.type === "meal" || tag === "stacey_abrams" || tag === "tshirts";
      const { points } = e;
      const { title } = e;
      return { title, tag, startTime, endTime, shouldWarn, points };
    });
    console.log(checkinInfo);
  })
  .catch(err => {
    console.log(err);
  });
