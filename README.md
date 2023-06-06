# Guitar tuner

It's a tuner based on web audio api which can work in three modes:
- **'All notes'** - user has access to all notes, including flat and sharp ones, and can tune string to any of them.
- **'Standard auto'** - tuner automatically understands what string user is trying to tune. (supports only standard tuning)
- **'Standard strict'** - user can choose one string and tune it individually. (supports only standard tuning)

## For what stands each file?

- **tuner.js** contains the main logic of the project.
- **app.js** the main file which connects tuner and UI.
- **meter.js, note.js,** *index.html, style.css* - UI.
