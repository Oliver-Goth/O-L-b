const BaseUrl = "o-loebrest20240718164438.azurewebsites.net"
const PostUrl = BaseUrl + "/api/Posts" // + "id"
const RunsUrl = BaseUrl + "/api/Runs"


Vue.createApp({
   data(){
      return{
         selectedRunid: -1,
         indexOfList: 1,
         ListOfRuns: [],
         addedPost: [],
         
         post:{
            Id: 0,
            Name: "",
            SequenceNumber: 0, 
            Radius: 0,
            GpsLatitude:0,
            GpsLongitude: 0,
            RunId: 0,
         },
         
      };
   },
   async created(){
      try{
         this.GetAllRuns(RunsUrl)
      }
      catch(error){
         console.log(error)
      }
   },
   methods:{
      async GetAllRuns(url){
         try{
            response = await axios.get(url)
            console.log(response.status, response)
            console.log(response.data.length)
            this.ListOfRuns = response.data
         }
         catch(error){
            console.log(error)
         } 
      },
      connectRun(item){
         this.selectedRunid = item
         console.log(this.selectedRunid)
      },
      async PushPost(){
         wasSend = true
         for(let i = 0; i < this.addedPost.length; i++){
            try{
               response = await axios.post(PostUrl, this.addedPost[i])
               console.log("Post respnse: ", i, this.addedPost[i], response)
            }
            catch(error){
               wasSend = false
               console.log("Post: ", i ,error)
               alert("!! der skete en fejl", error.message)
               return
            }
         }  
         if(wasSend){
            alert("Posterne blev tilføjet, du bliver nu sendt videre >>")
            var loc = window.location.pathname
            var dir = loc.substring(0, loc.lastIndexOf('/'))
            if(dir === undefined) {
               window.location.href = document.location.origin + "/quizquestions.html"
            } else {
               window.location.href = document.location.origin + "/" + dir + "/quizquestions.html"
            }
         } 
      },
      addPostToList(){
         if(!this.checkPost()){
            console.log("check 1 fejl")
            return
         }
         if(!this.checkPost2()){
            console.log("check 2 fejl")
            return
         } 
         if(!this.checkPost3()){
            console.log("check 3 fejl")
            return
         } 
         if(!this.checkPost4()){
            return
         } 
         else{
            this.post.RunId = this.selectedRunid.id;
            this.post.SequenceNumber = this.indexOfList;
            this.indexOfList = this.indexOfList + 1;
            let addeditem = {...this.post}
            this.addedPost.push(addeditem)
         }
      },

   // ------------    check  methoder    ---------------- // 
      checkPost(){
         if(this.selectedRunid === -1){
            console.log(this.selectedRunid)
            alert("Mangler at tilføje løb")
            return false
         } if(this.post.GpsLatitude <= -181 && this.post.GpsLatitude >= 181){
            console.log(this.post.GpsLatitude)
            alert("breddrad skal være mellem -180 og 180")
            return false
         } if(this.post.GpsLongitude <= -91 && this.post.GpsLongitude >= 91){
            console.log(this.post.GpsLongitude)
            alert("breddrad skal være mellem -90 og 90")
            return false
         }
         else{
            return true
         }
      },
      checkPost2(){
         if(this.post.GpsLatitude < -180 || this.post.GpsLatitude > 180){
            console.log(this.post.GpsLatitude)
            alert("bredegrad skal være mellem -180 og 180")
            return false
         } else {
            return true
         }
      },
      checkPost3(){
         if(this.post.GpsLongitude < -90 || this.post.GpsLongitude > 90){
            console.log(this.post.GpsLatitude)
            alert("Længdegrad skal være mellem -90 og 90")
            return false
         } else {
            return true
         }
      },
      checkPost4(){
         if(this.post.Name.length === 0){
            console.log(this.post.Name)
            alert("der er ikke navn på post")
            return false
         }else{
            return true
         }
      }
   }
}).mount("#app")