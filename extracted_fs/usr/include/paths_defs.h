/*------------------------------------------------------------
(C) Copyright [2015-2016] Marvell International Ltd.
All Rights Reserved
------------------------------------------------------------*/

/****************************************************************************
*  paths_defs.h
*    BIONIC and OpenWRT system have different dir-tree
*    Customer also could have a differences
*  Place all MRVL-Telephony paths in this .H and use them in .C
*  instead direct/explicit hard-coding in .C
*  This fixes OS-tree problem, customization problem and
*  also permits to create Customer-Documenattion just by "cut and paste"
****************************************************************************/

#ifndef PATHS_DEFS_H
#define PATHS_DEFS_H

#ifdef BIONIC
/* Android BIONIC */
#define TEMP_DIR                  "/tmp/"
#define SDCARD_MOUNT              "/sdcard/"
#define TEL_DIR                   "/system/marvell/tel/"
#define ETC_DIR                   "/system/etc/"
#define MRVL_MOD_DIR              "/system/lib/modules/"
#define NVM_DIR                   "/NVM/"
#define NVM_ORIG_DIR              TEL_DIR  "nvm_orig/"
#define LOG_DIR                   "/data/log/"
#define LOG_DIR_SD_RDP            SDCARD_MOUNT   ""
#define TRG_DB_DIR                "/NVM/mdb/"
/* END Android BIONIC */
#else
/* Non BIONIC (OpenWRT) */
#define TEMP_DIR                  "/tmp/"
#define SDCARD_MOUNT              "/sdcard/"
#define TEL_DIR                   "/bin/"
#define ETC_DIR                   "/etc/"
#define MRVL_MOD_DIR              "/lib/modules/3.10.33/"
#define NVM_DIR                   "/NVM/"
#define NVM_ORIG_DIR              ETC_DIR  "nvm_orig/"
#define LOG_DIR                   "/log/"
#define LOG_DIR_SD_RDP            SDCARD_MOUNT   ""
#define TRG_DB_DIR                "/NVM/mdb/"
//#define FOTA_DIR                ...
/* END Non BIONIC (OpenWRT) */
#endif

#define LOG_DIR_SD_LOG            SDCARD_MOUNT   "log/"
#define LOG_DIR_SD_MODEM          SDCARD_MOUNT   "modem_dump/"
#define EEH_JOURNAL_FILE          LOG_DIR  "eeh_journal.txt"
#define TASK_LIST_FILENAME        TEMP_DIR "tasklist.txt"
#define DIAG_LOG_PATH_FILE        TEMP_DIR "diag_log_path"
#define TEL_OK_FILE               TEMP_DIR "atcmdsrv_ok"

//Some strings (not a file) having special meaning and should be common
#define SWITCHMODEM_REQ           "Switch Modem"

#endif // PATHS_DEFS_H
