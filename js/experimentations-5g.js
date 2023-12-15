const HEADER_EXPERIMENTATEUR = "Expérimentateur"
const HEADER_FREQUENCES = "Fréquences utilisées"
const HEADER_DECISION_NUMERO = "Numéro de la décision d'autorisation de l'Arcep"
const HEADER_DECISION_LIEN = "Lien de la décision d'autorisation de l'Arcep"
const HEADER_TECHNO_PREFIXE = "Techno - "
const HEADER_USAGE_PREFIXE = "Usage - "
const HEADER_DESCRIPTION = "Description"


const TOOLTIP_TECHNOS = {
    "Massive MIMO": "Utilisation d'un nombre très important d'antennes, interférant entre elles de manière contrôlée",
    "Beamforming/beamtracking": "Formation de faisceaux d'ondes radio dirigés vers l'utilisateur",
    "Duplexage temporel (mode TDD)": "Utilisation d'une même bande de fréquences alternativement en sens montant et en sens descendant",
    "Mode de fonctionnement NSA (Non Stand Alone)": "Mode de fonctionnement non autonome de la 5G, où le réseau 5G vient en addition d'un réseau 4G",
    "Mode de fonctionnement SA (Stand Alone)": "Mode de fonctionnement autonome de la 5G, où le réseau 5G est déployé comme un nouveau réseau de bout en bout",
    "Synchronisation de réseaux": "Application d'une même répartition dans le temps des phases d'émission et de réception entre les stations de bases et les terminaux de plusieurs réseaux",
    "Network slicing": "Adaptation et reconfiguration du réseau de manière dynamique, de manière à adapter les performances en fonction des usages ciblés",
    "Small cells": "Installation d'antennes radio de petite taille et de faible portée, par exemple pour couvrir l'intérieur des bâtiments",
    "Accès dynamique au spectre": "Technique permettant de basculer dynamiquement d'un bloc de fréquences à l'autre",
}

const IMG_USAGES = {
    "Mobilité connectée": "img/voiture-connectee.png",
    "Internet des objets": "img/iot.png",
    "Ville intelligente": "img/smart-city.png",
    "Télémédecine": "img/medecine.png",
    "Réalité virtuelle": "img/vr.png",
    "Industrie du futur": "img/industrie.png",
    "Jeu Vidéo": "img/jeu-video.png",
    "Technique ou R&D": "img/r-et-d.png",
    "Autre": "img/autres.png",
}

leafletJs = document.getElementById("leaflet-js").src
leafletRoot = leafletJs.substring(0, leafletJs.lastIndexOf('/'))

const FREQUENCES = {
    "2,6 GHz TDD": { color: "gold", bgColor: "#f9e79f" },
    "3,8 GHz": { color: "red", bgColor: "#f1948a" },
    "26 GHz": { color: "blue", bgColor: "#aed6f1" },
}
const FREQUENCES_CATCHALL = "Autres"
FREQUENCES[FREQUENCES_CATCHALL] = { color: "green", bgColor: "#a5d69f" }

Object.values(FREQUENCES).forEach(v => {
    v.icon = new L.Icon({
        ...L.Icon.Default.prototype.options,
        // Les différentes icones de couleur doivent être importées depuis https://github.com/pointhi/leaflet-color-markers
        iconUrl: `img/markers/marker-icon-${v.color}.png`,
        iconRetinaUrl: `img/markers/marker-icon-2x-${v.color}.png`,
        shadowUrl: `${leafletRoot}/images/marker-shadow.png`, // on ne peut pas utiliser celle du Icon.Default car URL relative
    })
})

const panelExperimentation = function (data) {
    let panel = `<div class="details">`

    const usages = Object.entries(data)
        .filter(([k, v]) => k.startsWith(HEADER_USAGE_PREFIXE) && v)
        .reduce((acc, [k, v]) => {
            const usage = k.substring(HEADER_USAGE_PREFIXE.length)
            const image = IMG_USAGES[usage] || ''
            return `${acc}<li class="list-group-item border-0"><img src="${image}" alt="${usage}" title="${usage}" height="30px"></img></li > `
        }, "")
    if (usages) {
        panel += `<ul class="usages list-group list-group-horizontal float-end">${usages}</ul>`
    }

    panel += `<h2>${data[HEADER_EXPERIMENTATEUR]}</h2>`

    if (data[HEADER_DESCRIPTION]) {
        panel += `<div class="description">${data[HEADER_DESCRIPTION]}</div>`
    }

    panel += `<div class="table-responsive"><table class="table">`
    if (data[HEADER_DECISION_NUMERO]) {
        panel += `
        <tr class="border-top">
            <th>Décision d'autorisation de l'Arcep</th>
            <td>
                ${data[HEADER_DECISION_LIEN] ? '<a href="' + data[HEADER_DECISION_LIEN] + '" target="_blank" title="Décision de l\'Arcep n°&nbsp;' + data[HEADER_DECISION_NUMERO] + ' (ouverture dans une nouvelle page)">' : ''}
                ${data[HEADER_DECISION_NUMERO]}
                ${data[HEADER_DECISION_LIEN] ? '</a>' : ''}
            </td>
        </tr>`
    }
    if (data[HEADER_FREQUENCES]) {
        panel += `<tr><th>${HEADER_FREQUENCES}</th><td>${data[HEADER_FREQUENCES]}</td>`
    }

    const technos = Object.entries(data)
        .filter(([k, v]) => k.startsWith(HEADER_TECHNO_PREFIXE) && v)
        .map(([k, v]) => {
            const libelle = k.substring(HEADER_TECHNO_PREFIXE.length)
            const title = libelle in TOOLTIP_TECHNOS ? ` title="${TOOLTIP_TECHNOS[libelle]}"` : ''
            return `<span${title}>${libelle}</span>` // TODO essayer d'activer les tooltips Bootstrap ?
        })
        .join(', ')
    if (technos) {
        panel += `<tr><th>Technologies testées</th><td class="technos">${technos}</td>`
    }
    panel += "</table>"

    panel += `</div>`
    return panel
}

const isGeoValid = (data) => data.Latitude && data.Longitude && Number.isFinite(data.Latitude) && Number.isFinite(data.Longitude)
const isDateValid = (data) => {
    debut = data["Début"] && new Date(data["Début"])
    fin = data["Fin"] && new Date(data["Fin"])
    today = new Date()
    today.setHours(0, 0, 0, 0)
    return (!debut || debut <= today) && (!fin || fin >= today)
}

const parseCsvRow = function (results, parser) {
    const r = results.data
    if (results.errors.length == 0 && isGeoValid(r) && isDateValid(r)) {
        const frequence = FREQUENCES[r[HEADER_FREQUENCES]] || FREQUENCES[FREQUENCES_CATCHALL]
        marker = L.marker([r.Latitude, r.Longitude], {
            title: `${r[HEADER_EXPERIMENTATEUR]} - ${r[HEADER_FREQUENCES]}`,
            icon: frequence.icon,
        })
            .bindPopup(panelExperimentation(r), { maxWidth: "auto", })
            .addTo(frequence.layer)
        frequence.count = (frequence.count || 0) + 1
    } else {
        console.debug(`Pas affiché (erreurs : ${results.errors.length} - geo: ${isGeoValid(r)} - date: ${isDateValid(r)})`, results)
    }
}

const onInputFrequence = function (event) {
    const selected = event.target.value;
    Object.values(FREQUENCES).forEach(({ layer }, idx) => {
        if (!selected || selected == idx) {
            layer.addTo(map);
        } else {
            layer.remove();
        }
    });
}

const populateForm = function () {
    freq = document.getElementById("selectFrequences")
    Object.entries(FREQUENCES).forEach(([key, value], idx) => {
        const option = document.createElement("option")
        option.value = idx
        option.text = `${key} (${value.count || 0})`
        option.style = `background-color: ${value.bgColor};`
        freq.add(option)
    })
    freq.addEventListener("input", onInputFrequence)
}