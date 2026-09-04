//clock
setInterval(function () {
        document.querySelector("#timeElement").innerHTML = new Date().toLocaleString();
      }, 1000);

      
drag(document.getElementById("window"));  


//close window
function closeWelcomeWindow() {
  const closable = document.getElementById("window");
  if (closable) {
    closable.style.display = "none";
  }
}

//drag window
const draggable = document.getElementById("window");
if (draggable) {
  drag(draggable);
}

function drag(element) {
  var ix = 0, iy = 0, cx = 0, cy = 0;

  if (document.getElementById(element.id + "header")) {
    document.getElementById(element.id + "header").onmousedown = startDragging;
  } else {
     element.onmousedown = startDragging;
  }

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();

    ix = e.clientX;
    iy = e.clientY;

    document.onmouseup = stopDragging;
    document.onmousemove = dragElement; }

  function dragElement(e) {
      e = e || window.event;
      e.preventDefault();
      
      cx = ix - e.clientX;
      cy = iy - e.clientY;
      ix = e.clientX;
      iy = e.clientY;

      element.style.top = (element.offsetTop - cy) + "px";
      element.style.left = (element.offsetLeft - cx) + "px";}

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}