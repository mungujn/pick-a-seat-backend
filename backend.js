const common = require("./common-code/common");
const transactions = require("./common-code/transactions");
const C = common.CONSTANTS;

async function addAccount(account) {
    let uid = common.generateUID();
    account[C.CREATED_AT] = common.now();
    account[C.BALANCE] = 0.0;
    let location = `${C.ACCOUNTS}/${account[C.REQ_UID]}/${C.ALL}/${uid}`;
    await common.createData(location, account);
    return uid;
}

async function beginEmailValidation(uid, email_address) {
    let code = common.generateUID();
    await common.createData(
        `${C.USERS}/${uid}/${C.ADMIN}/${C.VALIDATION}`,
        {
            email_address: email_address,
            code: code,
            status: C.TRANSACTION_STARTED
        }
    );
    return await common.sendValidationEmail(email_address, code);
}

async function completeEmailValidation(uid, code) {
    let data = await common.readData(
        `${C.USERS}/${uid}/${C.ADMIN}/${C.VALIDATION}`
    );
    if (code === data.code) {
        await common.updateData(
            `${C.USERS}/${uid}/${C.ADMIN}/${C.VALIDATION}`,
            {
                status: C.TRANSACTION_COMPLETE
            }
        );

        return C.SUCCESSFUL
    }
    return "Validation failed"
}

async function editAccount(account) {
    account[C.MODIFIED_AT] = common.now();
    delete account[C.BALANCE]; // ensure no funny business
    let location = `${C.ACCOUNTS}/${account[C.REQ_UID]}/${C.ALL}/${
        account[C.UID]
    }`;
    await common.updateData(location, account);
    return true;
}

async function removeAccount(account) {
    let location = `${C.ACCOUNTS}/${account[C.REQ_UID]}/${C.ALL}/${
        account[C.UID]
    }`;
    let data = await common.readData(location);
    let balance = data[C.BALANCE];
    let transaction = {
        amount: balance,
        from_uid: account[C.REQ_UID],
        from_account: account[C.UID],
        to_uid: account[C.REQ_UID],
        to_account: C.DEFAULT_UGX_ACCOUNT,
        message: "Account deletion transaction"
    };
    transaction[C.TRANSACTION_ID] = await transactions.logNewTransaction(
        transaction
    );
    let result = await transactions.performMoneyTransaction(transaction);
    if (result === C.TRANSACTION_COMPLETE) {
        await common.deleteData(location);
        return true;
    } else {
        return false;
    }
}

async function startTransaction(transaction) {
    let can_send = await transactions.verifyBalance(transaction);
    if (can_send) {
        let ref = await transactions.logNewTransaction(transaction);
        return ref;
    }
    return false;
}

async function sendMoneyToAccount(transaction) {
    let data = await transactions.performMoneyTransaction(transaction);
    return data;
}

module.exports.addAccount = addAccount;
module.exports.beginEmailValidation = beginEmailValidation;
module.exports.completeEmailValidation = completeEmailValidation;
module.exports.editAccount = editAccount;
module.exports.removeAccount = removeAccount;
module.exports.startTransaction = startTransaction;
module.exports.sendMoneyToAccount = sendMoneyToAccount;
