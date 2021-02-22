/*
 *(C) Copyright 2007 Marvell International Ltd.
 * All Rights Reserved
 */

#ifndef __DIAG_IOCTL__
#define __DIAG_IOCTL__

#include <sys/ioctl.h>

#define DIAG_IOC_MAGIC 'W'
#define DIAG_IOC_DIRECT_RB_PATH_UP  _IO(DIAG_IOC_MAGIC, 1)
#define DIAG_IOC_DIRECT_RB_PATH_DOWN _IO(DIAG_IOC_MAGIC, 2)

#define DIAG_IOC_MAXNR 2

#endif /*__DIAG_IOCTL__*/
