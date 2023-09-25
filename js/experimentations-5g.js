

HEADER_EXPERIMENTATEUR = "Expérimentateur"
HEADER_FREQUENCES = "Fréquences utilisées"
HEADER_DECISION_NUMERO = "Numéro de la décision d'autorisation de l'Arcep"
HEADER_DECISION_LIEN = "Lien de la décision d'autorisation de l'Arcep"
HEADER_TECHNO_PREFIXE = "Techno - "
HEADER_USAGE_PREFIXE = "Usage - "
HEADER_DESCRIPTION = "Description"

const panelExperimentation = function (data) {
    let panel = `<div class="details">
        <h2>TODO</h2><!-- TODO : où je trouve la localisation ? -->`

    let usages = Object.entries(data)
        .filter(([k, v]) => k.startsWith(HEADER_USAGE_PREFIXE) && v)
        .reduce((acc, [k, v]) => `<li>${k.substring(HEADER_USAGE_PREFIXE.length)}</li > `, "") // TODO gérer les images et le style des listes
    if (usages) {
        panel += `<ul class="usages">${usages}</ul>`
    }

    panel += `<div class="table-responsive"><table class="table">`
    if (data[HEADER_EXPERIMENTATEUR]) {
        panel += `<tr><th>${HEADER_EXPERIMENTATEUR}</th><td>${data[HEADER_EXPERIMENTATEUR]}</td>`
    }
    if (data[HEADER_DECISION_NUMERO]) {
        panel += `
        <tr>
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

    let technos = Object.entries(data)
        .filter(([k, v]) => k.startsWith(HEADER_TECHNO_PREFIXE) && v)
        .map(([k, v]) => k.substring(HEADER_TECHNO_PREFIXE.length)) // TODO glossaire ?
        .join(', ')
    if (technos) {
        panel += `<tr><th>Technologies testées</th><td>${technos}</td>`
    }
    panel += "</table>"

    if (data[HEADER_DESCRIPTION]) {
        panel += `<div class="description">${data[HEADER_DESCRIPTION]}</div>`
    }

    // TODO : un contact ou pas besoin ?
    panel += `</div>`
    return panel
}

const parseCsvRow = function (results, parser) {
    const r = results.data
    if (r.Latitude && r.Longitude && Number.isFinite(r.Latitude) && Number.isFinite(r.Longitude)) {
        L.marker([r.Latitude, r.Longitude], {
            title: `${r[HEADER_EXPERIMENTATEUR]} - ${r[HEADER_FREQUENCES]}`,
        })
            .bindPopup(panelExperimentation(r))
            .addTo(map);
    }
}