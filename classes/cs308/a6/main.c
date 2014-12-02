#include "lib/util.h"

int main(int argc, char *argv[]) {
  char   * dir_name = argv[1];
  list_t * entries = dir_list(dir_name, 0);
  list_iter(entries, &display_fs_node);
  list_iter(entries, &free);
  list_dispose(entries);
}

/* EXAMPLE */
/*******************************************/
/* FILENAME:                  alpha */
/* FILE_TYPE:                 ordinary */
/* PERMISSIONS:               rw- r-- r-- */
/* OWNER_NAME:                jedwards */
/* GROUP_NAM:                 grad */
/* DATE_OF_LAST_MODIFICATION: Mar 30 08:11 2003 */
/* LINK_COUNT:                2 */
/* SIZE_IN_BYTES:             1345 (or 12, 6 dev info) */
/* INODE_NUMBER:              347  */
