var fetchedData;

window.addEventListener("load", async function(){
    let response = await fetch("https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData");
    fetchedData = await response.json();
    let region;
    try{
        region = localStorage.getItem("region");
    }
    catch{ //for non-localStorage support (for example, third-party data save not allowed for security reason...)
        document.getElementById("region-save").style.display = "none";
    }
    changed(region?region:"All");
});


function changed(value){
    if(value=="Others") value = null;
    let infectionData = getData("confirmed", value);
    let deathData = getData("deaths", value);
    let curedData = getData("recovered", value);

    let allData = getSum(infectionData, deathData, curedData);
    
    domFetcher.fetchAll({
        Infections: extractData(infectionData),
        Deaths: extractData(deathData),
        Recovers : extractData(curedData),
        Total: extractData(allData)
    }, value);

    function getData(type, region){
        var filteredData = fetchedData[type];
        if(region!="All") filteredData = filteredData.filter(data => data.healthCareDistrict == region);
        let returnData = filteredData.map(data=>{ return {x:data.date, y:1}; });

        return returnData;
    }

    function getSum(infections, deaths, cures){
        function reverseToMinus(dataMap) { return dataMap.map(data=>{ let x = data.x; let y = -data.y; return {x, y}; }); }

        var infectionInfo = infections;
        var curesInfo = reverseToMinus(cures);
        var deathsInfo = reverseToMinus(deaths);
        return infectionInfo.concat(curesInfo).concat(deathsInfo);
    }
    function extractData(dataInput){
        if(!dataInput) return [];
        var sum = 0;
        var datePosition = null; //just ++ for same date
        return dataInput.sort((a, b) => new Date(a.x)-new Date(b.x)) //some sorts went wrong.
            .reduce((acc, data)=>{
                sum += data.y;
                let dataDate = new Date(data.x);
                if(datePosition - dataDate == 0){
                    acc[acc.length-1].y = sum;
                }
                else{
                    acc.push({x: dataDate, y: sum});
                    datePosition = dataDate;
                }
                return acc;
            },[]);
    }
}