#ifndef __ML_UTILS_H__
#define __ML_UTILS_H__

#ifndef UNUSEDPARAM
#define UNUSEDPARAM(param) ((void) param)
#endif

#include <sys/stat.h>
#include <sys/sysinfo.h>
#include <fcntl.h>
#include <cutils/log.h>

#define ML_VERS_FNAME ETC_DIR "mversion"
#define ML_IMEI_PROP "persist.ml.imei"
#define ML_MSEQ_PROP "persist.ml.mseq"
#define ML_BOOTSEQ_PROP "persist.ml.bootseq"
#define ML_CP_VER_PROP "persist.ml.cp_ver"
#define ML_CP_TYPE_PROP "persist.sys.current.cp" //do not change, it is set somewhere else!
#define ML_CP_TYPE_LTG  3
#define ML_CP_TYPE_LWG 4

#define ML_ERRMSG(fmt,args...)   do { \
    int _fd = -1;\
    _fd = open("/dev/kmsg", O_RDWR | O_SYNC);\
    if (_fd != -1) { \
        char _bf[256]; \
        int _ln = snprintf(_bf, 255, "[pid(%d) %s %d] " fmt, getpid(),__FUNCTION__,__LINE__,##args); \
        if (_ln > 0){ \
            _ln = _ln > 255 ? 255: _ln; \
            write(_fd, _bf, _ln);\
        } \
        close(_fd);\
    } \
} while(0)

__attribute__ ((packed))
struct ml_cp_ver {
	char s[16];
};
__attribute__ ((packed))
struct ml_imei {
	char s[sizeof("012345678901234")];
};
__attribute__ ((packed))
struct ml_vers {
	char s[128];
};
__attribute__ ((packed))
struct ml_bld_vers {
	char s[sizeof("9999")];
};
__attribute__ ((packed))
struct ml_rand {
	char s[sizeof("9999")];
};
__attribute__ ((packed))
struct ml_mseq {
	char s[sizeof("9999")];
};

__attribute__ ((packed))
struct ml_uniqid {
	struct ml_imei imei;
	struct ml_bld_vers vers;
	struct ml_mseq mseq;
	struct ml_rand rand;
};

void ml_set_property(const char *name, int value);
int ml_get_property(const char *name);
void ml_set_long_property(const char *name, long int value);
long int ml_get_long_property(const char *name);
void ml_set_ulong_long_property(const char *name, unsigned long long value);
unsigned long long ml_get_ulong_long_property(const char *name);

unsigned long long ml_get_files_size(char *filenames);
unsigned long long ml_get_dir_size(char *filename);
char *ml_get_uniqid(struct ml_uniqid *uniqid);
char *ml_get_vers(struct ml_vers *m);
char *ml_get_bld_vers(struct ml_bld_vers *m);
char *ml_get_mseq(struct ml_mseq *m);
char *ml_get_imei(struct ml_imei *m);
char *ml_get_cp_ver(struct ml_cp_ver *m);
char *ml_update_imei(struct ml_imei *m);
char *ml_update_cp_ver(struct ml_cp_ver *m);
char *ml_extract_cp_from_full_vers(void);
int ml_get_boot_sequence(void);

int ml_init_stdfiles(void);
int ml_reboot_service(int nosync, int poweroff, void *opt);
/************************************************************************/
/*                                                                      */
/************************************************************************/
extern char *ml_setid_supergroup_radio[];
extern int ml_setid_supergroup_number_radio;
extern char *ml_setid_supergroup_audio[];
extern int ml_setid_supergroup_number_audio;
extern char *ml_setid_supergroup_diag[];
extern int ml_setid_supergroup_number_diag;
int ml_setid(int argc, char *argv[]);
int ml_nand(int argc, char *argv[]);
int ml_get_mtd_block_num (char *mtd_name);
/************************************************************************/
/*                                                                      */
/************************************************************************/

void ml_replace_badchars(char *str, size_t len);
void ml_pad_string(char pad, char *str, size_t len);

char *ml_str2file(char *fname, char *str, size_t len);
char *ml_file2str(char *fname, char *str, size_t len, int dopad);
char *ml_chomp(char *str);

struct ml_fifo {
	char *fname;
	int fdr;
	int fdw;
	int ok;
};
int ml_create_fifo(struct ml_fifo *fifo);
int ml_flock(int fd, char *fname, int mode);
int ml_write_fifo(struct ml_fifo *fifo, char *str, int len);
char *ml_read_fifo(struct ml_fifo *fifo, char *str, int len, struct timeval *timeout);
int ml_mounted_update(char *mountdir, char *dir2add);

int ml_check_path(const char* path, int r, int w);
int ml_dir_update(char *dir2add);

#define ML_SYSTEM_MAX_TIMEOUT 1800 // 30 min
int ml_system_retry(int max_tries, int timeout, char *cmd);
int ml_system(int timeout, char *cmd);
enum {
	ML_FLASH_FLAG_OLD_FOTA 		= 0x00000000,
	ML_FLASH_FLAG_ANDROID_FOTA 	= 0x00000001,
	ML_FLASH_FLAG_USER_MODE 	= 0x00000002,
	ML_FLASH_FLAG_PRODUCTION 	= 0x00000003,
	ML_FLASH_FLAG_DOWNLOAD 		= 0x00000004,
	ML_FLASH_FLAG_MAX 			= 0x00000005,
};
int ml_flash_flag_write(int flash_flag);

int ml_ini_puts(const char *section, const char *key, const char *value, const char *file);
int ml_ini_gets(const char *section, const char *key, const char *def_value, char *buf, int bufsize, const char *file);

///////////////////// LOG ////////////////////////
#define MLL_LOGCAT  0x1
#define MLL_KMSG    0x2
#define MLL_STDERR  0x4
#define MLL_CONSOLE 0x8

#define MLL_2ALL    (MLL_LOGCAT| MLL_KMSG | MLL_STDERR | MLL_CONSOLE)

enum {
	ML_LOG_DEBUG = ANDROID_LOG_DEBUG,
	ML_LOG_INFO = ANDROID_LOG_INFO,
	ML_LOG_WARN = ANDROID_LOG_WARN,
	ML_LOG_ERROR = ANDROID_LOG_ERROR,
	ML_LOG_ALWAYS = ANDROID_LOG_SILENT,
};

void ml_log(int dest, int level, const char *tag, const char *fmt, ...);
void ml_set_log_level(int logLevel);
int ml_get_log_level(void);
char *ml_get_local_tag(void);

#define ml_logf(dest, level, fmt, args...) \
  (level >= ml_get_log_level() ? \
  ((void)ml_log(dest, level, NULL, "[%s:" fmt, ml_get_local_tag(), ##args)):\
  (void)0)

#define ml_log_debug(fmt,args...)  	ml_logf(MLL_LOGCAT|MLL_KMSG, ML_LOG_DEBUG, "%s:%d DEBUG] " fmt "\r\n", __FUNCTION__, __LINE__, ##args)
#define ml_log_info(fmt,args...)	   ml_logf(MLL_LOGCAT|MLL_KMSG, ML_LOG_INFO, "%s:%d INFO] " fmt "\r\n", __FUNCTION__, __LINE__, ##args)
#define ml_log_warn(fmt,args...)	 ml_logf(MLL_LOGCAT|MLL_KMSG, ML_LOG_WARN, "%s:%d WARN] " fmt "\r\n", __FUNCTION__, __LINE__, ##args)
#define ml_log_error(fmt,args...)	  ml_logf(MLL_LOGCAT|MLL_KMSG, ML_LOG_ERROR, "%s:%d ERROR] " fmt "\r\n", __FUNCTION__, __LINE__, ##args)
#define ENTER ml_log_debug("Enter")
#define LEAVE ml_log_debug("Leave")

#if 0
/* Absolute tracer - outputs [Uptime: PID: TID : FUNCTION : LINE]*/
#define ml_logf_atrace(dest,fmt,args...) \
(level >= ml_max_log ? do{\
	struct sysinfo info;\
	info.uptime = 0;\
	sysinfo(&info);\
	ml_log(dest, "[%08lu:%d:%d:%s:%d] " fmt,\
	info.uptime, getpid(), gettid()\
	,__func__, __LINE__,\
	##args);\
} while(0)
#endif

#endif
