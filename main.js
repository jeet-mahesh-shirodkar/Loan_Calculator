function calculate() {

    var amount = document.getElementById("amount");
    var graph = document.getElementById("graph");
    var apr = document.getElementById("apr");
    var years = document.getElementById("years");
    var zipcode = document.getElementById("zipcode");
    var output = document.getElementById("output");
    var payment = document.getElementById("payment");
    var total = document.getElementById("total");
    var totalInterest = document.getElementById("totalInterest");

    var principal = parseFloat(amount.value);
    // console.l/og(principal)
    var interest = parseFloat(apr.value) / 100 / 12;
    var payments = parseFloat(years.value) * 12;
    // console.log(payment.innerHTML)

    //Now compute the monthly payment figure

    var x = Math.pow(1 + interest, payments);
    var monthly = (principal * x * interest) / (x - 1);


    if (isFinite(monthly)) {
        payment.innerHTML = monthly.toFixed(2);
        total.innerHTML = (monthly * payments).toFixed(2);
        totalInterest.innerHTML = ((monthly * payments) - principal).toFixed(2);
        save(amount.value, apr.value, years.value, zipcode.value);
        chart(principal,interest,monthly,payments);

        try {
            getLenders(amount.value, apr.value, years.value, zipcode.value);
        }
        catch (e) {
            // console.log("error")
        }
    }
    else {
        payment.innerHTML = "";
        total.innerHTML = "";
        totalInterest.innerHTML = "";
        chart();
    }
}

function save(amount,apr,years,zipcode){
    if(window.localStorage){
        localStorage.local_amount=amount;
        localStorage.local_apr=apr;
        localStorage.local_years=years;
        localStorage.local_zipcode=zipcode;
    }
}

window.onload=function(){
    if(window.localStorage && localStorage.local_amount){
        document.getElementById("amount").value=localStorage.local_amount;
        document.getElementById("apr").value=localStorage.local_apr;
        document.getElementById("years").value=localStorage.local_years;
        document.getElementById("zipcode").value=localStorage.local_zipcode;
    }
}

function getLenders(amount,apr,years,zipcode){
    if(!window.XMLHttpRequest)
        return ;
    var ad =document.getElementById("lenders");
    if(!ad)
    return;
    
   var url ="getLender.php"+"?amt="+encodeURIComponent(amount)+"&apr="+encodeURIComponent(apr)+
             "&yrs="+encodeURIComponent(years)+"&zip="+encodeURIComponent(zipcode);
   
   var req =new XMLHttpRequest();
   req.open(url)
   req.send(null);
   
   req.onreadystatechange = function(){
       if(req.readyState==4&&req.status==200){
       var response = req.responseText;
       var lenders = JSON.parse(response);
       
       var list="";
       for(var i=0;i<lenders.length;i++){
           list +="<li><a href='"+lenders[i].url+"'>"+lenders[i].name+"</a>"; 
      }
      ad.innerHTML="<ul>"+list+"</ul>";
    }
   }
}
//Charts Graph


// document.ge = `<li>${it}</`
function chart(principal,interest,monthly,payments){
       var graph = document.getElementById("graph");
       graph.width=graph.width; // clear and reset the canvas element ;
       
       //If there is no argument in canvas then just return it now

       if(arguments.length == 0 || graph.getContext) return;
       
       //Get the Context object for the <canvas> that defines the drawing API
       
       var g =graph.getContext("2d");
       var width =graph.width, height =graph.height; //Get the Canvas Size

       //These function will convert the payment numbers amount to pixels
       //Number to pixels Conversion
         
       function paymentToX(n){
           return n*width/payments;
       }
       function amountToY(a){
           return height-(a*height/(monthly*payments*1.05));
       }

       g.moveTo(paymentToX(0),amountToY(0)); //make it (0,0)
       g.lineTo(paymentToX(payments),amountToY(monthly*payments));

       g.lineTo(paymentToX(payments),amountToY(0));
       g.closePath();
       g.fillStyle="#f88";
       g.fill();
       g.font="bold 12px san-serif";
       g.fillText("Total Interest Payments",20,20); // Draw Text in legend

       var equity=0;
       g.beginPath();
       g.moveTo(paymentToX(0),amountToY(0));
       for(var p=1;p<=payments;p++){
           var thisMonthsInterest =(principal-equity)*interest;
           equity +=(monthly-thisMonthsInterest);
           g.lineTo(paymentToX(p),amountToY(equity));
       }
       g.lineTo(paymentToX(payments),amountToY(0));
       g.closePath();
       g.fillStyle="green";
       g.fill();
       g.fillText("Total Equity",20,35);

       var bal =principal;
       g.beginPath();
       g.moveTo(paymentToX(0),amountToY(bal));
       for(var p=1;p<=payments;p++){
           var thisMonthsInterest= b*interest;
           bal -=(monthly -thisMonthsInterest);
           g.lineTo(paymentToX(p),amountToY(bal));
       }
       g.lineWidth =3;
       g.stroke();
       g.fillStyle="black";
       g.fillText("loan Balance",20,50);

       g.textAlign ="center";
       var y =amountToY(0);
       for(var year=1;year*12<=payments;year++){
           var x =paymentToX(year*12);
           g.fillRect(x-0.5,y-3,1,3);
           if(year ==1) g.fillText("year",x,y-5);
           g.fillText(String(year),x,y-5);
       }
       
       g.textAlign="right";
       g.textBaseline ="middle";
       var ticks =[monthly*payments,principal];
       var rightEdge =paymentToX(payments);
       for(var i=0;i<ticks.length;i++){
           var y =amountToY(ticks[i]);
           g.fillRect(rightEdge-3,y-0.5,3,1);
           g.fillText(String(ticks[i].toFixed(0)),
           rightEdge-5,y);
       }
    }

