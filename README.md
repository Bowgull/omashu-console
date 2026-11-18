# omashu console 🔥

the front end of my couch game console. an old computer under the tv runs zelda breath of the wild and wow forever, and this is what you see between games: a dark pixel forest, a campfire, and two games to pick with a controller.

**▶ try it: https://bowgull.github.io/omashu-console/**

🚧 still building. rough edges are mine 🙂

## what's in it

- a campfire that really burns: flames, sparks, smoke, fireflies, and now and then a pair of eyes in the mist 👀
- the game menu: pick a game, it glides to the middle and breathes while the game loads
- "who's playing?" for zelda (player 1 / player 2)
- a campfire menu with a buttons screen, and turning off lets the fire die down
- real sounds: menu clicks and a crackling fire loop

this is the demo build. on the real console a small helper launches the games and tells the page what to show. here `demo.js` plays that part, so nothing actually launches: a pick plays the loading animation and comes back to the fire.

## controls

| | keyboard | controller |
|---|---|---|
| move | arrow keys | d-pad / left stick |
| pick | enter | A |
| back | esc / backspace | B |
| campfire menu | esc | start / view |

sound starts on your first key press (browsers want a click or key first). controllers work in chrome, edge and firefox, press a button once so the browser sees it.

## run it yourself

it's plain html and js, no build step. serve the folder with anything:

```bash
python -m http.server
```

then open http://localhost:8000.

## credits

- menu sounds: [Kenney](https://kenney.nl) Interface Sounds, CC0 (see `sounds/KENNEY-LICENSE.txt`)
- campfire loop: "Wood-Burning on Fireplace Sound Effect loop" by PagDev on OpenGameArt, CC0
- the zelda and wow logos belong to nintendo and blizzard

**what i did:** designed every screen, the forest, the fire, the menus, the sounds and how it all moves, and tested it on the couch with a controller. ai tools wrote the code, i was the very picky boss 🙂

MIT licensed.
