const parameterService = require('./parameter-service');
const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');

// Create a transporter object using SMTP transport
let transporter = {};

async function init(companyId) {
    transporter[companyId] = nodemailer.createTransport({
        host: await parameterService.getParameter(companyId, "smtp_host"),
        port: await parameterService.getParameter(companyId, "smtp_port"),
        secure: await parameterService.getParameter(companyId, "smtp_ssl"),
        auth: {
            user: await parameterService.getParameter(companyId, "smtp_user"),
            pass: await parameterService.getParameter(companyId, "smtp_password"),
        }
    });
};

async function sendMail(companyId, to, cc, subject, text) {
    // Check if the transporter is initialized
    if (!transporter[companyId]) {
        logger.info("Initializing mail transporter");
        await init(companyId);
    }
    // Setup email data
    let mailOptions = {
        from: await parameterService.getParameter(companyId, "smtp_from"),
        to: to,
        subject: subject,
        text: htmlToText(text),
        html: text
    };

    // Send the email
    return new Promise((resolve, reject) => {
        transporter[companyId].sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            resolve(info);
        });
    });
}

module.exports = { name: 'mailsend',  sendMail };