/*
Wikiweaver v1.0

A simple javascript that turns a .json file into a simple wiki webpage
This will fetch pages.json

Supports:
-Multiple pages with page navigator
-Custom text styles markers
-Images (from local file)
-Different sections in single page
-Text links
-Lists

Note that this is not meant for large wiki. Page nesting is not supported.

by namakayo
*/

let page=null;

let pages={};
let elements=[];
let sections={};
let pageNs={};
let pageCons={};
let dropdownNs={};
let dropdownImgs={};
let dropdowns={};

const nav=document.getElementById("nav");
const navn=document.getElementById("navn");
const search=document.getElementById("search");
const builtinFolder="assets/builtin/"
let navOpened=false;
let navbutPos=0;
let navWidth=0;
let currentPage="404";
let noClickTimer=0;
let lastSearch="";

function makeCodesCopyable(){
  const codes=document.getElementsByTagName("code");
  for(c of codes){
    let txt=c.innerHTML;
    c.addEventListener("click",function(){
      navigator.clipboard.writeText(txt);
    });
  }
}
function lerp(from,to,amount){
  return from+(to-from)*amount;
}
function removeElement(e){
  elements.splice(elements.indexOf(e),1);
  e.remove();
}
function addElement(e){
  const div=document.getElementById("main");
  addElementTo(e,div);
}
function addElementTo(e,t){
  elements.push(e);
  t.appendChild(e);
}
function clearPage(){
  for(e of elements){
    e.remove();
  }
}
function parseStyle(all){
  for(p in all){
    for(c in all[p].contents){
      txt=all[p].contents[c].txt;
      if(txt!=null){
        for(let i=0;i<txt.length;i++){
          let sliceText=txt.slice(i,i+2);
          let replace="";
          switch(sliceText){
            case "!*":
              replace="<b>";
              break;
            case "*!":
              replace="</b>";
              break;
            case "!/":
              replace="<i>";
              break;
            case "/!":
              replace="</i>";
              break;
            case "!_":
              replace="<u>";
              break;
            case "_!":
              replace="</u>";
              break;
            case "!-":
              replace="<tiny>";
              break;
            case "-!":
              replace="</tiny>";
              break;
            case "!`":
              replace="<code>";
              break;
            case "`!":
              replace="</code>";
              break;
            case "!#":
              replace="<s>";
              break;
            case "#!":
              replace="</s>";
              break;
          }
          if(replace!=""){
            txt=txt.slice(0,i)+replace+txt.slice(i+2);
          }
          
          if(txt.slice(i,i+2)=="!n"){
            txt=txt.slice(0,i)+"<br>"+txt.slice(i+2);
          }
        }
        all[p].contents[c].txt=txt;
      }
    }
  }
  pages=all;
}
function openPage(p){
  if(!(p in pages))return;
  clearPage();
  page=p;
  currentPage=p;
  
  for(c of pages[p].contents){ 
    if(c.section!=null){
      txt=c.section;
      let np=document.createElement("p");
      np.innerHTML=txt;
      np.className="section";
      addElement(np);
      sections[txt]=np;
    }
    if(c.txt!=null){
      txt=c.txt;
      partLink=c.partLink==null?false:c.partLink;
      let np=document.createElement(c.link==null?"p":(partLink?"p":"pl"));
      let tl;
      if(partLink){
        let t1=document.createElement("span");
        tl=document.createElement("pl");
        let t2=document.createElement("span");
        let split=txt.split("!LINK!");
        t1.innerHTML=split[0];
        tl.innerHTML=c.linkText;
        t2.innerHTML=split[1];
        t1.className="intxt";
        tl.className="intxt";
        t2.className="intxt";
        tl.style.display="inline";
        np.className="txt";
        addElementTo(t1,np);
        addElementTo(tl,np);
        addElementTo(t2,np);
      }else{
        np.innerHTML=txt;
        np.className="txt";
      }
      let linkP=partLink?tl:np;
      if(c.link!=null){
        linkP.href="#";
        const link=c.link;
        const linksec=c.linkSection;
        if(linksec==null){
          linkP.onclick=function(){
            openPage(link);
          };
        }else{
          linkP.onclick=function(){
            if(currentPage!=link){
              openPage(link);
              window.scrollTo(0, 0);
            }
            to=sections[linksec];
            to.scrollIntoView({
              block: "start",
              behavior: "smooth"
            });
          };
        }
      }
      addElement(np);
    }
    if(c.img!=null){
      let p=document.createElement("img");
      p.src="assets/"+c.img.src;
      p.alt=c.img.alt==null?c.img.src:c.img.alt;
      p.width=(c.img.width==null?150:c.img.width);
      p.className="txt";
      addElement(p);
    }
    if(c.list!=null){
      let l=document.createElement(c.list.order?"ol":"ul");
      for(li of c.list.contents){
        let p=document.createElement("li");
        if(c.list.code){
          p.innerHTML="<code>"+li+"</code>";
        }else{
          p.innerHTML=li;
        }
        p.className="txt";
        addElementTo(p,l);
      }
      addElement(l);
    }
    if(c.dlist!=null){
      let l=document.createElement("dl");
      let boldTop=c.dlist.boldTop==null?false:c.dlist.boldTop;
      let code=c.dlist.code==null?false:c.dlist.code;
      let codeDesc=c.dlist.codeDesc==null?false:c.dlist.codeDesc;
      for(lii in c.dlist.contents){
        let li=c.dlist.contents[lii];
        let dt=document.createElement("dt");
        dt.innerHTML=li.txt;
        dt.className="txt";
        let dd=document.createElement("dd");
        dd.innerHTML=li.desc;
        dd.className="txt";
        if(boldTop&&lii==0){
          dt.innerHTML="<b>"+li.txt+"</b>";
          dd.innerHTML="<b>"+li.desc+"</b>";
        }
        if(code){
          if(boldTop){
            if(lii!=0){
              dt.innerHTML="<code>"+li.txt+"</code>";
              if(codeDesc)dd.innerHTML="<code>"+li.desc+"</code>";
            }
          }else{
            dt.innerHTML="<code>"+li.txt+"</code>";
            if(codeDesc)dd.innerHTML="<code>"+li.desc+"</code>";
          }
        }
        addElementTo(dt,l);
        addElementTo(dd,l);
      }
      addElement(l);
    }
  }
  let placeholder=document.createElement("p");
  addElement(placeholder);
  makeCodesCopyable();
}
function toggleDropdown(p) {
  return function () {
    dropdowns[p]=!dropdowns[p];
  };
}
function setupNav(){
  if(Object.keys(pages).length===0)return;
  for(pa in pages){
    let con=document.createElement("div");
    let p=document.createElement("n");
    p.innerHTML=pages[pa].title;
    p.href="#";
    p.width=navWidth-50;
    const link=pa;
    p.onclick=function(){
      openPage(link);
      navOpened=false;
    };
    let b=document.createElement("button");
    b.className="cbut";
    let bimg=document.createElement("img");
    dropdownImgs[pa]=bimg;
    con.className="ncon";
    b.onclick=toggleDropdown(pa);
    addElementTo(bimg,b)
    addElementTo(p,con);
    addElementTo(b,con);
    addElementTo(con,navn);
    dropdownNs[pa]=[];
    pageNs[pa]=p;
    pageCons[pa]=con;
    for(k of pages[pa].contents){
      k.hidden=k.hidden==null?false:k.hidden;
      if(k.section!=null&&!k.hidden){
        let stitle=k.section;
        let p=document.createElement("n");
        p.innerHTML=stitle;
        p.style.marginLeft="20px";
        p.href="#";
        p.style.display="none";
        p.className="nsec";
        const link=pa;
        p.onclick=function(){
          openPage(link);
          to=sections[stitle];
          window.scrollTo(0, 0);
          to.scrollIntoView({
            block: "start",
            behavior: "smooth"
          });
          navOpened=false;
        };
        dropdownNs[pa].push(p);
        addElementTo(p,navn);
      }
    }
  }
}
function clearNav(){
  for(p in pages){
    for(e in dropdownNs[p]){
      dropdownNs[p][e].remove();
    }
    pageCons[p].remove()
  }
}
function update(){
  navWidth=Math.min(window.innerWidth,400);
  if(Object.keys(pages).length==0){
    fetch("pages.json").then(r=>r.json()).then(data=>parseStyle(data));
  }
  if(page==null){
    if(window.location.search){
      const params=new URLSearchParams(window.location.search);
      let fpage=params.get("at");
      if(pages[fPage]!=null){
        openPage(fPage);
      }else{
        openPage("main");
      }
    }else{
      openPage("main");
    }
  }
  if(navn.children.length<=1){
    setupNav();
    lastSearch="";
  }
  if(navOpened){
    navbutPos=lerp(navbutPos,navWidth-50,0.3);
  }else{
    navbutPos=lerp(navbutPos,0,0.3);
  }
  navbut.style.left=navbutPos+"px";
  nav.style.width=navWidth-50+"px";
  nav.style.left=navbutPos-getComputedStyle(nav).width.replace("px","")+"px";
  
  if(currentPage!="404")document.getElementById("title").innerHTML=pages[currentPage].title;
  
  for(p in pages){
    if(pageNs[p].style.display=="none"){
      dropdownImgs[p].src="";
      continue;
    }
    if(dropdownNs[p].length==0){
      dropdownImgs[p].display="none";
      dropdownImgs[p].style.width="0px";
      dropdownImgs[p].style.height="0px";
    }else{
      dropdownImgs[p].src=dropdowns[p]?builtinFolder+"arrowup.png":builtinFolder+"arrowdown.png";
      for(pe of dropdownNs[p]){
        pe.style.display=dropdowns[p]?"block":"none";
      }
    }
  }
  
  if(search.value!=lastSearch){
    let s=search.value.toLowerCase();
    clearNav();
    setupNav();
    let titlePass={};
    for(p in dropdownNs){
      if(dropdownNs[p].length==0)continue;
      for(el of dropdownNs[p]){
        if(el.innerHTML.toLowerCase().includes(s)){
          titlePass[p]=true;
          continue;
        }
        //for some reason el.remove() causes a weird bug so...
        el.innerHTML="";
        el.style.width="0px";
        el.style.height="0px";
        el.style.margin="0px";
        el.style.padding="0px";
      }
    }
    for(p in pageNs){
      if(titlePass[p]||pages[p].title.toLowerCase().includes(s)){
      }else{
        removeElement(pageCons[p]);
      }
    }
    lastSearch=search.value;
    for(p in pages){
      dropdowns[p]=true;
    }
    if(lastSearch==""){
      for(p in pages){
        dropdowns[p]=false;
      }
    }
  }
  noClickTimer--;
  requestAnimationFrame(update);
}
update();

navbut.addEventListener("click",function(){
  noClickTimer=10;
  navOpened=!navOpened;
})
document.addEventListener("click", function(e) {
  let pos={x:e.clientX,y:e.clientY};
  if(navOpened){
    if(pos.x>navbutPos&&noClickTimer<=0){
      navOpened=false;
    }
  }
});