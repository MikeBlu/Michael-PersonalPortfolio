let menuShown = false;

window.onload = () => {

    const indicator = document.getElementById("cursorIndicator");

    function resetAnimationClass(element, animationClass) {
        console.log("animation asserted");
        if (element.classList.contains(animationClass)) {
            element.classList.remove(animationClass); // reset animation
        }
        void element.offsetWidth; // trigger reflow
        element.classList.add(animationClass); // start animation
    }

    document.body.onpointermove = event => {
        const { clientX, clientY } = event;

        indicator.animate({
            left: `${clientX}px`,
            top: `${clientY}px`
        
        }, {duration: 300, fill: "forwards"})

        indicator.style.maskPosition = `${clientX}px ${clientY}px`;

    }

    let navCards = document.querySelectorAll('div[class^="navCard"]');

    function setProfileImageShake() {
        let profileImage = document.getElementById("picContainer");
        console.log("classChange asserted");
        profileImage.classList.remove("slideAndShake");
        profileImage.addEventListener("click", function(e) {
            resetAnimationClass(profileImage,"shakeOnClick");
        });
        profileImage.addEventListener("touchstart", function(e) {
            resetAnimationClass(profileImage,"shakeOnClick");
        });
    }

    setTimeout(setProfileImageShake,1500);

    function rotateNavCards(open) {
        for (let i = 0; i < navCards.length; i++ ) {
            navCards[i].style.visibility = (open)?("hidden"):("visible");
            navCards[i].style.transform = `rotate(${(open)?(0):(30*(i+1))}deg)`;
        }
    }


    const navIcon = document.getElementById("hamburgerMenu_SVG");
    navIcon.onclick = () => {
        if (menuShown) {
            navIcon.childNodes[1].style.transform = "none";
            navIcon.childNodes[3].style.opacity = "100%";
            navIcon.childNodes[5].style.transform = "none";
            rotateNavCards(true);
            menuShown = false;
        } else {
            navIcon.childNodes[1].style.transform = "translate(5px,-22px) rotate(45deg)";
            navIcon.childNodes[3].style.opacity = "0%";
            navIcon.childNodes[5].style.transform = "translate(5px,25px) rotate(-45deg)";
            rotateNavCards(false);
            menuShown = true;
        }
    };

    const mapPoints = document.getElementsByClassName("rmap_fill")
    , timelineTrailBr = document.getElementById("timelineTrailBright"),
    markerText = document.getElementsByClassName("markerText");

    for (let i = 0; i < mapPoints.length; i++) {
        if ( markerText[i] == undefined) continue;
        mapPoints[i].addEventListener('mouseenter', function(e) {
            markerText[i].style.visibility ="visible";
        });
        mapPoints[i].addEventListener('mouseleave', function(e) {
            markerText[i].style.visibility ="hidden";
        });
        document.addEventListener('touchstart', function checkHover() {
            if (mapPoints[i].matches(':hover')) {
                markerText[i].style.visibility ="visible";
            } else {
                markerText[i].style.visibility ="hidden";
            }
        });
    }

    mapPoints[mapPoints.length-1].addEventListener('mouseenter', function(e) {
        timelineTrailBr.style.opacity = "100%";
    });
    mapPoints[mapPoints.length-1].addEventListener('mouseleave', function(e) {
        timelineTrailBr.style.opacity = "0%";
    });
    document.addEventListener('touchstart', function checkHover() {
        if (mapPoints[mapPoints.length-1].matches(':hover')) {
            timelineTrailBr.style.opacity = "100%";
        } else {
            timelineTrailBr.style.opacity = "0%";
        }
    });
};