(() => {
    const clouds = document.querySelectorAll("[data-word-cloud]");

    clouds.forEach((cloud) => {
        const words = Array.from(cloud.querySelectorAll(".word-cloud-word"));
        let active = null;

        const setOffset = (word, x, y) => {
            word.style.setProperty("--drag-x", `${x}px`);
            word.style.setProperty("--drag-y", `${y}px`);
        };

        const updateOrbit = (dragX, dragY) => {
            if (!active) {
                return;
            }

            const draggedCenter = {
                x: active.origin.x + dragX,
                y: active.origin.y + dragY,
            };

            words.forEach((word) => {
                if (word === active.word) {
                    return;
                }

                const origin = active.origins.get(word);
                const away = {
                    x: origin.x - draggedCenter.x,
                    y: origin.y - draggedCenter.y,
                };
                const distance = Math.max(Math.hypot(away.x, away.y), 1);
                const radius = active.radius;
                const force = Math.max(0, 1 - distance / radius);
                const push = force * force * 58;

                setOffset(word, (away.x / distance) * push, (away.y / distance) * push);
            });
        };

        const resetCloud = () => {
            cloud.classList.remove("is-dragging");
            words.forEach((word) => {
                word.classList.remove("is-dragging");
                setOffset(word, 0, 0);
            });
            active = null;
        };

        words.forEach((word) => {
            word.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                word.setPointerCapture(event.pointerId);

                const rect = word.getBoundingClientRect();
                active = {
                    word,
                    pointerId: event.pointerId,
                    start: { x: event.clientX, y: event.clientY },
                    origin: {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    },
                    radius: Math.max(rect.width, rect.height) * 2.8,
                    origins: new Map(words.map((item) => {
                        const itemRect = item.getBoundingClientRect();
                        return [item, {
                            x: itemRect.left + itemRect.width / 2,
                            y: itemRect.top + itemRect.height / 2,
                        }];
                    })),
                };

                cloud.classList.add("is-dragging");
                word.classList.add("is-dragging");
            });

            word.addEventListener("pointermove", (event) => {
                if (!active || active.word !== word || active.pointerId !== event.pointerId) {
                    return;
                }

                const dragX = event.clientX - active.start.x;
                const dragY = event.clientY - active.start.y;

                setOffset(word, dragX, dragY);
                updateOrbit(dragX, dragY);
            });

            word.addEventListener("pointerup", resetCloud);
            word.addEventListener("pointercancel", resetCloud);
        });
    });
})();
