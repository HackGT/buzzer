(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{147:function(e,t,n){},148:function(e,t,n){},184:function(e,t,n){},233:function(e,t,n){e.exports=n(399)},399:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),r=n(49),s=n.n(r),c=(n(147),n(96)),i=n(41),l=n(223),u=n(36),m=n(37),p=n(39),h=n(38),g=n(40),d=n(30),f=n(406),v=[{key:"0",text:"Live Site",value:"live_site"},{key:"1",text:"Twitter",value:"twitter"},{key:"2",text:"Twilio",value:"twilio"},{key:"3",text:"Slack",value:"slack"},{key:"4",text:"Mobile",value:"f_c_m"},{key:"5",text:"MapGT",value:"map_g_t"}],C=(n(148),function(e){function t(){var e;return Object(u.a)(this,t),(e=Object(p.a)(this,Object(h.a)(t).call(this))).state={},e}return Object(g.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this;return o.a.createElement(f.a,{className:"dropdownCustom",name:"droppy",compact:!0,placeholder:"Select Client",onChange:function(t,n){var a=n.value;return e.props.onClientChange(a)},fluid:!0,multiple:!0,selection:!0,options:v})}}]),t}(a.Component)),b=n(407),y=n(404),k=n(140),E=n.n(k),j=n(213),O=(n(339),"query {\n    areas(start: 0) {\n        name\n        mapgt_slug\n    }\n    talks(start: 0) {\n      base {\n          start_time\n          end_time\n          title\n          description\n          area {\n              name\n              mapgt_slug\n              capacity\n          }\n      }\n      people {\n          name\n          bio\n          link\n          image {\n              url\n          }\n      }\n    }\n    faqs(start: 0) {\n        title\n        description\n    }\n    meals(start: 0) {\n        base {\n            start_time\n            end_time\n            title\n            description\n            area {\n                name\n                mapgt_slug\n                capacity\n            }\n        }\n        restaurant_name\n        restaurant_link\n        menu_items {\n            name\n            dietrestrictions {\n                name\n            }\n        }\n    }\n}");function _(){return(_=Object(j.a)(E.a.mark(function e(){return E.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("https://cms.hack.gt/graphql",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:O})}).then(function(e){return e.json()}).catch(function(e){return!1}));case 1:case"end":return e.stop()}},e)}))).apply(this,arguments)}var w={},S=function(e){function t(){var e;return Object(u.a)(this,t),(e=Object(p.a)(this,Object(h.a)(t).call(this))).state={},e}return Object(g.a)(t,e),Object(m.a)(t,[{key:"componentDidMount",value:function(){(function(){return _.apply(this,arguments)})().then(function(e){w=e})}},{key:"render",value:function(){var e=this,t=this.props.config,n=this.props.selectedClients.map(function(n){return o.a.createElement("div",null,o.a.createElement(b.a,{as:"h3"},n.charAt(0).toUpperCase()+n.slice(1).replace("_","")),Object.keys(e.props.config[n]).map(function(a){switch(t[n][a].type){case"dropdown":var r=w.data[t[n][a].cms].map(function(e,o){return{text:e[t[n][a].text],value:e[t[n][a].value],key:o+""}});return o.a.createElement(f.a,{placeholder:""+a,className:"dropdownCustom",compact:!0,fluid:!0,selection:!0,options:r,onChange:function(t,o){var r=o.value;return e.props.onConfigChange(r,a,n)}});case"string":return o.a.createElement(y.a,{className:"inputCustom",placeholder:a,onChange:function(t,o){var r=o.value;return e.props.onConfigChange(r,a,n)}});case"boolean":return o.a.createElement(f.a,{placeholder:""+a,className:"dropdownCustom",compact:!0,fluid:!0,selection:!0,options:[{key:"0",text:"True",value:!0},{key:"1",text:"False",value:!1}],onChange:function(t,o){var r=o.value;return e.props.onConfigChange(r,a,n)}});case"string-array":return o.a.createElement(y.a,{className:"inputCustom",placeholder:"Input all "+a,onChange:function(t,o){var r=o.value;return e.props.onConfigChange(r.split(","),a,n)}})}}))});return o.a.createElement("div",null,n)}}]),t}(a.Component),N=n(142),x=n(102),z=(n(184),n(141)),T=n.n(z),B=function(e){function t(){var e;Object(u.a)(this,t),(e=Object(p.a)(this,Object(h.a)(t).call(this))).handleClick=function(){e.setState({modal_open:!1}),T.a.save("BUZZER_TOKEN",e.state.token,{path:"/"}),e.props.onCookieSet(e.state.token)};var n=T.a.load("BUZZER_TOKEN");return n&&e.props.onCookieSet(n),e.state={modal_open:!n},e}return Object(g.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this;return o.a.createElement("div",null,o.a.createElement(N.a,{onClick:function(){e.setState({modal_open:!0})}}," Enter Buzzer Token "),o.a.createElement(x.a,{open:this.state.modal_open},o.a.createElement(x.a.Header,null,"Enter Buzzer Secret"),o.a.createElement(x.a.Content,null,o.a.createElement(y.a,{className:"inputCustom",placeholder:"Buzzer Secret",onChange:function(t,n){var a=n.value;return e.setState({token:a})}}),o.a.createElement(N.a,{content:"Submit",onClick:this.handleClick}))))}}]),t}(a.Component),q={live_site:{title:{type:"string"},icon:{type:"string"}},slack:{channels:{type:"string-array"},at_channel:{type:"boolean"},at_here:{type:"boolean"}},twilio:{numbers:{type:"string-array"},groups:{type:"string-array"}},twitter:{_:{type:"boolean"}},f_c_m:{header:{type:"string"},id:{type:"string"}},map_g_t:{area:{type:"dropdown",cms:"areas",value:"mapgt_slug",text:"name"},title:{type:"string"},time:{type:"string"}}},M=n(405),$=function(e){function t(){var e;return Object(u.a)(this,t),(e=Object(p.a)(this,Object(h.a)(t).call(this))).state={clients:[]},e.onDataChange=e.onDataChange.bind(Object(d.a)(Object(d.a)(e))),e.onConfigChange=e.onConfigChange.bind(Object(d.a)(Object(d.a)(e))),e.close=e.close.bind(Object(d.a)(Object(d.a)(e))),e}return Object(g.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this;return o.a.createElement("div",null,o.a.createElement(B,{onCookieSet:function(t){e.setState({buzzer_secret:t})}}),o.a.createElement("br",null),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"column"},o.a.createElement(b.a,{as:"h1"},"Buzzer UI"))),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"column"},o.a.createElement(C,{onClientChange:function(t){e.setState(function(e){return{clients:Object(l.a)(t)}})}}))),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"column"},o.a.createElement(y.a,{className:"inputCustom",placeholder:"Message",onChange:function(t,n){var a=n.value;return e.setState({message:a})}}))),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"column"},o.a.createElement(S,{config:q||{},selectedClients:this.state.clients||[],onConfigChange:this.onConfigChange}))),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"column"},o.a.createElement(N.a,{content:"Submit",onClick:function(t,n){n.value;return e.onSendNotification()}}))),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"column"},o.a.createElement(M.a,{open:this.state.open,onCancel:this.close,onConfirm:this.close,content:'Message: "'+this.state.message+'" sent to '+this.state.clients}))))}},{key:"close",value:function(){this.setState({open:!1})}},{key:"onSendNotification",value:function(){!function(e,t,n,a){var o=t.map(function(e){return console.log("client:!"),console.log(e),Object(i.a)({},e,Object(c.a)({},n))});console.log("schema"),console.log(o);var r={};o.map(function(e){var t=Object.keys(e)[0];r[t]=e[t]}),console.log(r),fetch("/graphql",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:"Basic "+a},body:JSON.stringify({query:"query send_message($message:String!, $plugins:PluginMaster!) {\n  send_message(message: $message, plugins: $plugins) {\n    plugin\n    errors {\n      error\n      message\n    }\n  }\n}",variables:{message:e,plugins:r}})}).then(function(e){return e.json()}).then(function(e){return console.log("Success!",e),!0})}(this.state.message,this.state.clients,this.state[this.state.clients],this.state.buzzer_secret);this.setState({open:!0})}},{key:"onDataChange",value:function(e,t){this.setState(Object(i.a)({},t,e))}},{key:"onConfigChange",value:function(e,t,n){var a=this;console.log(e,t),this.setState(function(o){return Object(i.a)({},n,Object(c.a)({},o[a.state.clients],Object(i.a)({},t,e)))})}}]),t}(a.Component);n(398),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(o.a.createElement($,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[233,1,2]]]);
//# sourceMappingURL=main.335a4522.chunk.js.map