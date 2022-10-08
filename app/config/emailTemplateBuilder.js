const fs = require("fs");

const broadcastEmailBuilder = async (params) => {

    let emailtext = params.emailText.split('{');
    
    let emailHTML = fs
        .readFileSync("./app/emailTemplates/broadcast.html")
        .toString();
    
    emailHTML = emailHTML.replace(
        "[[text1]]",
        emailtext[0]
    );
    emailHTML = emailHTML.replace(
        "[[text2]]",
        emailtext[1]
    );
    emailHTML = emailHTML.replace(
        "[[text3]]",
        emailtext[2]
    );
    emailHTML = emailHTML.replace(
        "[[text4]]",
        emailtext[3]
    );
    emailHTML = emailHTML.replace(
        "[[text5]]",
        emailtext[4]
    );

    emailHTML = emailHTML.replace(
        "[[applicationLogo]]",
        params.applicationLogo
    );
    emailHTML = emailHTML.replace(
        /OrganizationName/g,
        params.organisationName
    );
    emailHTML = emailHTML.replace(
        "[[name]]",
        params.fname
    );
    emailHTML = emailHTML.replace(
        "[[broadcastMessage]]",
        params.broadcastmessage
    );

    return emailHTML;
};

module.exports = {
    broadcastEmailBuilder,
};
