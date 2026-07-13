let p=document.createElement("p")
p.innerHTML="i am messing around with this wiki, please return later.<br>"
if(window.location.search){
  const params=new URLSearchParams(window.location.search);
  p.innerHTML+=params.get("at")
}else{
  p.innerHTML+="running on localhost"
}
document.getElementById("main").appendChild(p)