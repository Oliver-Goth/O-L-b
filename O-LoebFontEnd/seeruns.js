const BaseUrl = "o-loebrest20240718164438.azurewebsites.net"
const PostUrl = BaseUrl + "/api/Posts" // + "id"
const RunsUrl = BaseUrl + "/api/Runs"


Vue.createApp({
   data(){
      return{
         selectedRun: -1,
         ListofRuns: [],
         ListofPosts: [],
         FilteredList: [],
      };
   },
   async created(){
        this.GetAllRuns(RunsUrl)
   },
   methods:
   {
        async GetAllRuns(url){
            try{
                response = await axios.get(url)
                console.log(response.status, response)
                this.ListofRuns = response.data
                }
                catch(error){
                console.log(error)
                }
                this.GetAllPosts(PostUrl)
            },

        async GetAllPosts(url){
            try{
                response = await axios.get(url)
                console.log(response.status, response)
                this.ListofPosts = response.data
                }
                catch(error){
                console.log(error)
                }
            },

        connectRun(item){
            this.selectedRun=item.id
            console.log(this.selectedRun)
            this.postfilter()
        },

        postfilter(){
            this.FilteredList=""
            this.FilteredList=this.ListofPosts.filter(x => x.runId===this.selectedRun)
            this.FilteredList.sort((a,b) => {
                return a.sequenceNumber - b.sequenceNumber
            })
            console.log(this.FilteredList)
        },

        initializeMap() {
            const filteredPosts = this.ListofPosts.filter(x => x.runId === this.selectedRun);

            
            // let centerPoint = [ 12.0780378, 55.6310684]; // Default set to Roskilde

            for (const p of filteredPosts) {
                if (p.sequenceNumber === 1) {
                    centerPoint = [p.gpsLatitude, p.gpsLongitude];
                    break; // Exit the loop once a center with sequence number 1 is found
                }
            }

            let center = centerPoint;

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

