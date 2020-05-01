function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    let elements = document.getElementsByTagName('input');
    const name = elements.namedItem("login").value.trim();
    const email = elements.namedItem("email").value.trim();
    const img_url = elements.namedItem("obrazok").value.trim();
    const commentary = document.getElementById("textarea").value;
    const is_good_source = elements.namedItem("check").checked;
    const favourite_team = elements.namedItem("datalist_input").value.trim();
    /*if(selected === null){
        selected = {value: "neviem"};
    }
    const radio_option = selected.value;*/
    let selected = "Neviem";
    if(document.getElementById("r1").checked)
        selected = "TÃ¡to strÃ¡nka sa mi pÃ¡Äi.";
    else if(document.getElementById("r2").checked)
        selected = "TÃ¡to strÃ¡nka sa mi celkom pÃ¡Äi.";
    else if(document.getElementById("r3").checked)
        selected = "TÃ¡to strÃ¡nka sa mi nepÃ¡Äi.";
    const radio_option = selected;

    //3. Verify the data
    if(name==="" || email==="" || commentary===""){
        window.alert("Please, your name, opinion and email address");
        return;
    }

    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: name,
            email: email,
            img_url: img_url,
            radio_option: radio_option,
            commentary: commentary,
            is_good_source: is_good_source,
            favourite_team: favourite_team,
            created: new Date()
        };


    let opinions = [];

    if(localStorage.myPageComments){
        opinions=JSON.parse(localStorage.myPageComments);
    }

    opinions.push(newOpinion);
    localStorage.myPageComments = JSON.stringify(opinions);

    //4. Notify the user
    window.alert("Your opinion has been stored. Look to the console");
    console.log("New opinion added");
    console.log(opinions);

    //5. Go to the opinions
    window.location.hash="#opinions";

}



function remove_old(event) {
    //event.preventDefault();
    opinions=JSON.parse(localStorage.MyPageComments);
    for (const opn of opinions)
    {
        if(Date.now() - new Date(opn.created) > 86400000)
            opinions -= opn;
    }
    localStorage.MyPageComments = JSON.stringify(opinions);
    opinionsElm.innerHTML=opinionArray2html(opinions);
}
