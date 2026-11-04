# Direction 02 photo shot list

The images bundled in `src/d2/photo/files/` are **AI-generated concept images** (Figma AI, November 2026). They were made for the design review because licensed photography couldn’t be fetched in the build environment. They don’t show real people or places. Replace every one with a licensed or commissioned photo before launch.

**To replace one:** save the real photo as `src/d2/photo/files/<slot>.webp` (same name, overwriting the AI image), then add its credit in `src/d2/photo/credits.ts` and remove the slot from the AI list there. Recommended: 1600 px on the long edge, WebP, under 250 KB. Shoot or crop square or 4:5 with the subject away from the very top edge (a header floats there).

Commissioning notes: documentary, natural light, warm and gentle tones; real farmers of Buldhana / Vidarbha with informed consent; avoid staged smiles and branded products.

| Slot | Shot | Used in |
|---|---|---|
| `harvest-baler` | A tractor-drawn baler working a harvested paddy field at golden hour, low angle, straw dust in the light. Buldhana or Punjab. | Event poster (baling demo), Book a service option, step "Harvest", booking requested |
| `harvest-bales` | Rectangular straw bales stacked at a field edge at dusk, farmer silhouetted, village tree line behind. | Cover story (straw collection) |
| `harvest-hands` | Close-up of a farmer’s weathered hands binding a paddy sheaf with straw, shallow depth of field. | Video "Baling paddy straw" |
| `paddy-transplant` | Women transplanting paddy seedlings in a flooded field in the morning, reflections in the water, hills behind. | Sign-in header, step "Sowing" |
| `paddy-closeup` | Close-up of ripening paddy panicles with morning dew, backlit. | Video (decomposer), step "Pesticides", search topic |
| `paddy-field` | Wide, lush green paddy field with a farmer walking along the bund, monsoon clouds. | Today hero (midday), My fields index, field tiles, field added |
| `wheat-field` | A wheat field at golden hour with a farmer walking through the crop, warm backlight. | Today hero (afternoon), wheat field, wheat bookings |
| `wheat-grain` | Close-up of harvested wheat grain held in a farmer’s cupped palm. | Video (wheat storage), search topic |
| `mustard-field` | A mustard field in full yellow bloom, village and trees on the horizon, clear winter sky. | Onboarding page 3, field tiles |
| `cotton-picking` | A woman picking cotton bolls in a Vidarbha field, cotton bag over her shoulder, soft daylight. | Cotton field, step "Intercultivation", booking tickets |
| `cotton-drip` | Drip irrigation lines running along cotton rows, low angle, receding into the distance. | Guide and video (drip irrigation), step "Water" |
| `soil-sample` | Hands lifting a soil slice from a V-shaped cut with a khurpi, sample bucket beside it. | Guide (soil health card), video (soil sample), soil camp |
| `soil-texture` | Dark, crumbly black cotton soil after ploughing, raking light showing texture. | News (stubble burning), search topic |
| `village-meeting` | A Kisani Didi talking with a group of farmers under a neem tree, notebook in hand, documentary style. | Kisani Didi panel, season records, help, contact |
| `village-delivery` | Bags of fermented organic manure being unloaded from a truck at a village delivery point. | Onboarding page 2, news (FOM deliveries), order placed, step "Transport" |
| `workshop-demo` | Farmer training workshop in a village hall, agronomist demonstrating compost to seated farmers. | Training workshop and soil camp events |
| `canal-irrigation` | An irrigation canal between green fields, reflection of the sky, early morning. | Canal field, search topic |
| `monsoon-sky` | Heavy monsoon clouds over open fields, a farmer with an umbrella on the bund. | Today hero when it rains, weather news |
| `fom-product` | Close-up texture of fermented organic manure in an open sack, with a farmer’s hand for scale. | Order FOM, order tickets, step "Nutrients", guide (using FOM) |
| `machinery-tractor` | A tractor with a rotavator turning a field, dust in the air, documentary angle. | Guide (seeders), Book a service, step "Land preparation" |
| `farmer-portrait` | Environmental portrait of a farmer standing in his field at dawn, looking at the camera, natural light. | Me profile cover |
| `dawn-field` | Wide dawn view over a farm in Buldhana: mist low on the fields, a lone tree, first light. | Today hero (early morning), onboarding page 1, location |
