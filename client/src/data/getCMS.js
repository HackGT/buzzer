var fetch = require('node-fetch')
var fs = require('fs')
var queryMessage = `query {
    areas(start: 0) {
        name
        mapgt_slug
    }
    talks(start: 0) {
      base {
          start_time
          end_time
          title
          description
          area {
              name
              mapgt_slug
              capacity
          }
      }
      people {
          name
          bio
          link
          image {
              url
          }
      }
    }
    faqs(start: 0) {
        title
        description
    }
    meals(start: 0) {
        base {
            start_time
            end_time
            title
            description
            area {
                name
                mapgt_slug
                capacity
            }
        }
        restaurant_name
        restaurant_link
        menu_items {
            name
            dietrestrictions {
                name
            }
        }
    }
}`
// var workshopMessage = `query {
//     workshops(start: 0) {
//       id
//       start_time
//       end_time
//       createdAt
//       updatedAt
//       image {
//         url
//         hash
//       }
//     }
//     meals(start: 0) {
//       restaurant {
//         name
//       }
//       start_time
//       end_time
//       description
//       tags {
//         name
//       }
//       menu_items {
//         name
//         diet_restriction
//       }
//     }
//     events(start: 0) {
//       start_time
//       end_time
//       title
//       description
//       tags {
//         name
//       }
//     }
// }`

export default async function getCMSData() {
	return fetch('https://cms.hack.gt/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': `application/json`,
				'Accept' : `application/json`,
                'Access-Control-Allow-Headers': '*'

                
			},
			body: JSON.stringify({
				query: queryMessage,
			})
		}).then(r => {
			return r.json();
		}).catch(err => {
            return false;
		});
}
// getCMSData().then(result => {
//     fs.writeFile('resources_all.json', JSON.stringify(result), (err) => {
//         if (err) throw err;
//         console.log('Resources saved!');
//     });
// });
