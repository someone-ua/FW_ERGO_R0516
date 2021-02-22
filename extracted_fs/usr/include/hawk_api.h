#ifndef _HAWK_API_H_
#define _HAWK_API_H_
// all messages are in the following format:
// initiator message_type param3 param4
// event ID is needed only if there are preprepered logs saved for hawk.

#include "paths_defs.h"

#define EEH2HAWK_BOOT                 "eeh boot\n"
#define EEH2HAWK_ASSERT_NOTIFY        "eeh assert_notify\n"
#define EEH2HAWK_ASSERT_READY         "eeh assert_ready %s\n"  //param 3 is event ID
#define EEH2HAWK_ASSERT_READY_MODE    2
#define EEH2HAWK_SIRESET_NOTIFY       "eeh sr_notify\n"
#define EEH2HAWK_SIRESET_READY        "eeh sr_ready %s\n"  //param 3 is event ID
#define EEH2HAWK_SIRESET_READY_MODE   1
#define EEH2HAWK_MTSD_OK              "eeh mtsd_ok\n"
#define EEH2HAWK_ASSERT_DETECTED      "eeh assert_detected %d\n"

#define HOST2HAWK_DO_KEEP_ALIVE  "host do_keep_alive\n"
#define HOST2HAWK_DO_ASSERT  "host do_assert %s\n"  //text can be "apps" or "comm"
#define HOST2HAWK_DO_RESET  "host do_reset\n"
#define HOST2HAWK_DO_FOTA  "host do_fota\n"

#define HAWK_FIFO_NAME      TEMP_DIR  "hawk_fifo"
#define HAWK_HALT_ON_LOW_VOLTAGE (3560)

#endif
