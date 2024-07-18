const BaseUrl = "o-loebrest20240718164438.azurewebsites.net"
const GetPostUrl = BaseUrl + "/api/Posts" // + "id"
const PoshRunsUrl = BaseUrl + "/api/Runs"

Vue.createApp({
   data(){
      return{
         showAddPostForm: false,
         RunTypsList: ["O-løb","Stjerne-løb"],
         ListOfPosts: [{
            "id": 3,
            "name": "roskirke",
            "sequenceNumber": 1,
            "sadius": 23,
            "gpsLatitude": 23.23232,
            "gpsLongitude": 110.23232,
            "runId": 0
         }],
         RunToAdd: {
            Id: 0,
            Name: "",
            RunType: ""
         },
      };
   },
   methods: {
      async PoshNewRun(){
         try{
            response = await axios.post(PoshRunsUrl, this.RunToAdd).then(response => {console.log(response.status, response.data.token)})
            this.AddedRunSuccesMessege = "Løb blev tilføjet"
            this.RunToAdd.Name = ""
            this.RunToAdd.RunType = ""
            console.log(document.location.pathname)
            alert("Run was added")
            
            var loc = window.location.pathname
            var dir = loc.substring(0, loc.lastIndexOf('/'))
            if(dir === undefined) {
               window.location.href = document.location.origin + "/post.html"
            } else {
               window.location.href = document.location.origin + "/" + dir + "/post.html"
            }
          }
         catch (ex) {
            alert(ex.message)
         }
      },
   }
}).mount("#app")


