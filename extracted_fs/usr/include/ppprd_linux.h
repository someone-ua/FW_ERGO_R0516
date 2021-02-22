/*
 * ppprd_linux.h -- ppp router driver header file
 *
 * (C) Copyright [2006-2008] Marvell International Ltd.
 * All Rights Reserved
 *
 */

#ifndef __PPPRD_LINUX_H__
#define __PPPRD_LINUX_H__

#define PPP_FRAME_SIZE 0xC00

#define PPPRD_IOC_MAGIC 'X'

#define PPPRD_IOCTL_TEST _IOW(PPPRD_IOC_MAGIC, 1, int)
#define PPPRD_IOCTL_TIOPPPON _IOW(PPPRD_IOC_MAGIC, 2, int)
#define PPPRD_IOCTL_TIOPPPOFF _IOW(PPPRD_IOC_MAGIC, 3, int)
#define PPPRD_IOCTL_TIOPPPSETCB _IO(PPPRD_IOC_MAGIC, 4)
#define PPPRD_IOCTL_TIOPPPRESETCB _IO(PPPRD_IOC_MAGIC, 5)

#endif
