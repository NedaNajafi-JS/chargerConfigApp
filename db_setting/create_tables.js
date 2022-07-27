
create_tables = function(db_connection){

    /**
     * Create "SETTING, USERS, NETWORK_SETTING" tables in "WebTools" sqlite database.
     * 
     * USERS and  NETWORK_SETTING HAVE FOREIGN-KEYS IN SETTING TABLE.
     * SETTING and USERS tables have one-to-many-communication, means each setting may connect to many users.
     * 
     * All the tables have their _ID field as primary-key.
     * AUTHENTICATION_TYPE -> QR=1   RFID=2 
     * OPERATIN_MODE -> Wifi=1   GSM=2   LAN=3
     * internetConnection -> Server=1   Client=2
    */
   const query_create_table_setting =`CREATE TABLE IF NOT EXISTS SETTING
                                    (_ID INTEGER DEFAULT 0 PRIMARY KEY AUTOINCREMENT, 
                                    DATE_Modify TEXT, 
                                    typeValue TEXT,
                                    serialNO TEXT,
                                    manufactureAddress TEXT,
                                    SoftwareVersion TEXT,
                                    framewareVersion TEXT,
                                    selfCheck TEXT,
                                    AUTHENTICATION_TYPE INTEGER, 
                                    OPERATIN_MODE INTEGER, 
                                    internetConnection INTEGER, 
                                    SSID INTEGER, 
                                    PASSWORD TEXT, 
                                    maxCurrent, 
                                    maxVoltage INTEGER, 
                                    costValue INTEGER, 
                                    OCPPValue_1 TEXT, 
                                    OCPPValue_2 TEXT, 
                                    OCPPValue_3 INTEGER)`;

     
     /**
    * Users who are registered by RFID Authentication.
    * @param _ID - RFID
    * @param BLOCK_STATUS - 1 IF BLOCKED, 0 IF NON-BLOCKED
    */
   const query_create_table_rfid_users =`CREATE TABLE IF NOT EXISTS USERS
                                        (_ID INTEGER DEFAULT 0 PRIMARY KEY AUTOINCREMENT,
                                        SETTING_ID INTEGER, 
                                        NAME TEXT,
                                        RFIDCode TEXT,
                                        BLOCK_STATUS INTEGER DEFAULT 0,
                                        FOREIGN KEY (SETTING_ID) REFERENCES SETTING(_ID))`;

    
    /**
    * Clients who can login to webtool with their username and password.
    */
   const query_create_table_clients =`CREATE TABLE IF NOT EXISTS CLIENTS
                                    (_ID INTEGER DEFAULT 0 PRIMARY KEY AUTOINCREMENT,
                                    USERNAME INTEGER, 
                                    PASSWORD TEXT,
                                    DATE_REGISTERED TEXT,
                                    LAST_LOGIN TEXT)`;

    /**
     * Reporting page
     */
    const query_create_table_reportInfo = `CREATE TABLE IF NOT EXISTS REPORTINFO
                        (_ID INTEGER DEFAULT 0 PRIMARY KEY AUTOINCREMENT,
                        USER TEXT,
                        TOTAL_ENERGY INTEGER,
                        TOTAL_COST INTEGER,
                        DATE INTEGER)`
    
   
    db_connection.run(query_create_table_setting);
    db_connection.run(query_create_table_rfid_users);
    db_connection.run(query_create_table_clients);
    db_connection.run(query_create_table_reportInfo);
}

module.exports = create_tables;