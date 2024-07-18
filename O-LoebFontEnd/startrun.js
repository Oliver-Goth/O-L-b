const BaseUrl = "o-loebrest20240718164438.azurewebsites.net" //"http://localhost:5189" 
const PostUrl = BaseUrl + "/api/Posts" // + "id"
const RunsUrl = BaseUrl + "/api/Runs"
const QsUrl = BaseUrl + "/api/Questions"
const AnwsersUrl = BaseUrl + "/api/Answer"
const playerURL = BaseUrl + "/api/GPSLocation/1"


 
Vue.createApp({
   data(){
      return{
         ToggleRun: false,
         buttonText: "Start",
         RunTime: 0.0,
         TotalAnswerd: 0,
         CorrectAnwers: 0,
         playerLocation: [12.078352, 55.6307763], // id hent fra id 1 ALTID
         postCount: 0,
         QCount: 0,
         nextPost: {},
         selectedRun: -1,

         ListofRuns: [],
         ListofPosts: [],
         ListOfQs: [],
         ListOfAnswer: [],

         FilteredList: [],
         FilteresQs: [],
         FilteresAnwsers: [],
      }
   },
   async created(){
      this.GetAllRuns(RunsUrl)
   },
   methods: {
      toggle(){ // til at starte 5 sek intavaller
         if( this.buttonText === "Start" ){ this.buttonText = "Stop" }
         else{ this.buttonText = "Start" }
         this.ToggleRun = !this.ToggleRun
         console.log(this.ToggleRun)
         if(this.ToggleRun){
            this.getPayerLocation()
            this.RunIson()
            //this.initializeMap()
         }
      },
      async RunIson(){
         while(this.ToggleRun){
            this.RunTime += 1
            await new Promise(r => setTimeout(r, 1000));
         }
      },

      async GetAllRuns(url){
         try{
            response = await axios.get(url)
            //console.log(response.status, response)
            this.ListofRuns = response.data
            console.log("Runs ", this.ListofRuns.length, this.ListofRuns)
            this.GetAllPosts(PostUrl)
            }
            catch(error){
            console.log(error)
         }
      },
      async GetAllPosts(url){
         try{
            response = await axios.get(url)
            //console.log(response.status, response)
            this.ListofPosts = response.data
            console.log("posts ", this.ListofPosts.length, this.ListofPosts)
            this.GetAllQuestions()
         }
         catch(error){
            console.log(error)
         }
      },
      async GetAllQuestions(){
         try{
            response = await axios.get(QsUrl)
            //console.log(response.status, response)
            this.ListOfQs = response.data
            console.log("Qs ",this.ListOfQs.length, this.ListOfQs)
            this.GetAllAnswer()
         }
         catch(error){
            console.log(error)
         }
      },
      async GetAllAnswer(){
         try{
            response = await axios.get(AnwsersUrl)
            //console.log(response.status, response)
            this.ListOfAnswer = response.data
            //console.log("Svard ",this.ListOfAnswer.length, this.ListOfAnswer)
         }
         catch(error){
            console.log(error)
         }
      },
      connectRun(item){
         this.selectedRun=item.id
         console.log(this.selectedRun)
         this.postCount = 0   
         this.postfilter()
         this.NextPost() 
      },
      chooseQ(){

      },
      NextPost(){
         this.nextPost = this.FilteredList[this.postCount]
         this.filterQs()
      },
      PostUpDown(up){
         if(up === 1 && this.postCount < this.FilteredList.length){
            try{
               this.FilteredList[this.postCount++]
               this.NextPost()
            }
            catch(error){
               console.log(error)
            }
         }
         if(up === 0 && this.postCount > 0){
            this.postCount--
            this.NextPost()
         }
         console.log(this.postCount)
      },

      postfilter(){
         this.FilteredList=""
         this.FilteredList=this.ListofPosts.filter(x => x.runId===this.selectedRun)
         this.FilteredList.sort((a,b) => {
               return a.sequenceNumber - b.sequenceNumber
         })
         console.log("filters posts: ",this.FilteredList)
      },
      filterQs(){
         if(this.FilteredList.length < 1){
            this.nextPost = null
            console.log("poster er null")
            return
         }
         else{
            console.log("post til at finde ", this.nextPost)
            this.FilteresQs = []
            this.FilteresQs = this.ListOfQs.filter(x => x.postId === this.nextPost.id)
            console.log("Qs filterd: ",this.FilteresQs)  
            this.filterAnwsersTest()
         } 
      },
      filterAnwsersTest(){
         this.FilteresAnwsers = []
         this.FilteresQs.forEach(Q => {
            AnswerSet = []
            this.ListOfAnswer.forEach(A => {
               if(A.questionId === Q.id){
                  AnswerSet.push(A)
               }
            })
            if(AnswerSet.length > 0){
               this.FilteresAnwsers.push({Q, AnswerSet})
            }
         })
         console.log("test tilter: " ,this.FilteresAnwsers)
      },

      async getPayerLocation() {
         let playerPointStart = null; // Declare playerPointStart outside the loop
         let playerPointMove = null; // Declare playerPointMove outside the loop
       
         while (this.ToggleRun) {
           try {
             const response = await axios.get(playerURL);
             this.playerLocation = [response.data.latitude, response.data.longitude];
       
             if (!playerPointStart) {
               // Create a new start marker if it doesn't exist
               const customMarkerElementStart = document.createElement('div');
               customMarkerElementStart.className = 'custom-marker-start';
               customMarkerElementStart.style.width = '20px';
               customMarkerElementStart.style.height = '20px';
               customMarkerElementStart.style.borderRadius = '50%';
               customMarkerElementStart.style.backgroundColor = 'red';
       
               playerPointStart = new tt.Marker({ element: customMarkerElementStart })
                 .setLngLat([this.playerLocation[1], this.playerLocation[0]])
                 .addTo(map);
             }
       
             if (!playerPointMove) {
               // Create a new move marker if it doesn't exist
               const customMarkerElementMove = document.createElement('div');
               customMarkerElementMove.className = 'custom-marker-move';
               customMarkerElementMove.style.width = '20px';
               customMarkerElementMove.style.height = '20px';
               customMarkerElementMove.style.borderRadius = '50%';
               customMarkerElementMove.style.backgroundColor = 'blue';
       
               playerPointMove = new tt.Marker({ element: customMarkerElementMove })
                 .setLngLat([this.playerLocation[1], this.playerLocation[0]])
                 .addTo(map);
             } else {
               // Update the move marker's position if it exists
               playerPointMove.setLngLat([this.playerLocation[1], this.playerLocation[0]]);
             }
       
             setTimeout(() => {
               // Remove the move marker after 5 seconds
               map.removeLayer(playerPointMove);
             }, 5000);
           } catch (error) {
             console.log(error.message);
           }
       
           // await new Promise(r => setTimeout(r, 5000));
           // console.log(this.playerLocation[0], this.playerLocation[1])
         }
       },
       

      initializeMap() {
         const filteredPosts = this.ListofPosts.filter(x => x.runId === this.selectedRun);

         
         let centerPoint = [ 12.0780378, 55.6310684]; // Default set to Roskilde

         // for (const p of filteredPosts) {
         //     if (p.sequenceNumber === 1) {
         //         centerPoint = [p.gpsLongitude, p.gpsLatitude];
         //         break; // Exit the loop once a center with sequence number 1 is found
         //     }
         // }
         centerPoint = [this.playerLocation[0], this.playerLocation[1]];

         let center = centerPoint;

         //console.log("Center location" + center)

         map = tt.map({
             key: "vEdHLNMgoA1msNHdxlnxOW7fbO2vcDZC",
             container: "map",
             center: center,
             zoom: 10,
         });
         map.on("load", () => {
            filteredPosts.forEach(post => {
               let div = document.createElement('div')
               div.innerHTML = [post.sequenceNumber]

               let border = document.createElement('div')
               border.className = 'marker-border'

               let popup = new tt.Popup({
                  closeButton: false,
                  closeOnClick: false,
                  togglePopup: false,
               }).setDOMContent(div);

               let marker = new tt.Marker({
                  element: border
              }).setLngLat([post.gpsLatitude, post.gpsLongitude]).addTo(map);

              marker.setPopup(popup).togglePopup();
            });
         });
     },
   },
}).mount("#app")