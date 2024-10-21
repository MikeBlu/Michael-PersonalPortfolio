let menuShown = false;

    window.onload = () => {
        const indicator = document.getElementById("cursorIndicator");

        document.body.onpointermove = event => {
            const { clientX, clientY } = event;

            indicator.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            
            }, {duration: 500, fill: "forwards"})

            indicator.style.maskPosition = `${clientX}px ${clientY}px`;

        }

        let navCards = document.querySelectorAll('div[class^="navCard"]');

        function rotateNavCards(open) {
            for (let i = 0; i < navCards.length; i++ ) {
                navCards[i].style.visibility = (open)?("hidden"):("visible");
                navCards[i].style.transform = `rotate(${(open)?(0):(30*(i+1))}deg)`;
            }
        }


        const navButton = document.getElementById("navButton");
        const navIcon = document.getElementById("hamburgerMenu_SVG");
        navButton.onclick = () => {
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

        let mouseEnterEvent = 'ontouchstart' in window ? 'touchstart' : 'mouseenter',
        mouseLeaveEvent = 'ontouchend' in window ? 'touchend' : 'mouseleave';

        for (let i = 0; i < mapPoints.length; i++) {
            if ( markerText[i] == undefined) continue;
            mapPoints[i].addEventListener(mouseEnterEvent, function(e) {
                markerText[i].style.visibility ="visible";
            });
            mapPoints[i].addEventListener(mouseLeaveEvent, function(e) {
                markerText[i].style.visibility ="hidden";
            });
        }

        mapPoints[mapPoints.length-1].addEventListener(mouseEnterEvent, function(e) {
            timelineTrailBr.style.opacity = "100%";
        });
        mapPoints[mapPoints.length-1].addEventListener(mouseLeaveEvent, function(e) {
            timelineTrailBr.style.opacity = "0%";
        });
};