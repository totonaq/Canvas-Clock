document.querySelector(".bar").addEventListener("click", function() {
	var list = document.querySelector("#list");
	list.classList.toggle("visible");
});
$("#list").slideDown();