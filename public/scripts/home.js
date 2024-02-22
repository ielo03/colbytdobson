let lastMouseY = 0;

window.addEventListener('load', function () {
    window.addEventListener('pageshow', function() {
        document.querySelector('html').classList.remove('background-transition');
    });

    document.addEventListener('mousemove', function(event) {
        lastMouseY = event.clientY;
        if (mouseInMainContent(event)) {
            window.requestAnimationFrame(animateList);
        }
    });

    document.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', function() {
            if (link.id !== "logout") {
                runAnimation();
            }
        });
    });
});

function runAnimation() {
    document.querySelector('html').classList.add('background-transition');
}

function mouseInMainContent(event) {
    const headerHeight = document.getElementById('navbar').offsetHeight;
    const footerTop = document.getElementById('footer').offsetTop;
    const mouseY = event.clientY;

    return mouseY > headerHeight && mouseY < footerTop;
}

function getRectWithoutBottomPadding(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const paddingBottom = parseInt(style.paddingBottom, 10);

    return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom - paddingBottom,
        left: rect.left,
        width: rect.width,
        height: rect.height - paddingBottom,
    };
}


function animateList() {
    const listItems = document.querySelectorAll('#links .link');

    listItems.forEach(function(item) {
        const itemRect = getRectWithoutBottomPadding(item);
        const itemY = itemRect.top + itemRect.height / 2;
        const distance = lastMouseY - itemY;


        const scale = 1 + (Math.exp(-Math.pow(distance / 50, 2)) / 3);

        item.style.transform = `scale(${scale})`;
    });
}