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
    "Mobilité connectée": "https://arcep.fr/fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/Voitureconnectee.png",
    "Internet des objets": "https://arcep.fr/fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/IoT.png",
    "Ville intelligente": "https://arcep.fr/fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/Smartcity.png",
    "Télémédecine": "https:/arcep.fr//fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/Medecine.png",
    "Réalité virtuelle": "https://arcep.fr/fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/VR.png",
    "Industrie du futur": "https://arcep.fr/fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/Industrie.png",
    "Jeu Vidéo": "https://arcep.fr/fileadmin/reprise/dossiers/thd-radio/Expes5G/pictos/Jeuvideo.png",
    "Technique ou R&D": "", // TODO
    "Autre": "", // TODO
}

leafletJs = document.getElementById("leaflet-js").src
leafletRoot = leafletJs.substring(0, leafletJs.lastIndexOf('/'))

LEAFLET_COLOR_MARKERS = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img"

const [blueIcon, goldIcon, redIcon] = ["blue", "gold", "red"].map(color => new L.Icon({
    ...L.Icon.Default.prototype.options,
    iconUrl: `${LEAFLET_COLOR_MARKERS}/marker-icon-${color}.png`,
    iconRetinaUrl: `${LEAFLET_COLOR_MARKERS}/marker-icon-2x-${color}.png`,
    shadowUrl: `${leafletRoot}/images/marker-shadow.png`, // on ne peut pas utiliser celle du Icon.Default car URL relative
}))

const ICON_FREQUENCES = {
    "26 GHz": blueIcon,
    "2,6 GHz TDD": goldIcon,
    "3,8 GHz": redIcon,
}

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

const parseCsvRow = function (results, parser) {
    const r = results.data
    if (r.Latitude && r.Longitude && Number.isFinite(r.Latitude) && Number.isFinite(r.Longitude)) {
        L.marker([r.Latitude, r.Longitude], {
            title: `${r[HEADER_EXPERIMENTATEUR]} - ${r[HEADER_FREQUENCES]}`,
            icon: ICON_FREQUENCES[r[HEADER_FREQUENCES]],
        })
            .bindPopup(panelExperimentation(r), { maxWidth: "auto", })
            .addTo(map);
    }
}