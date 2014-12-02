#include <unistd.h>
#include "lib/util.h"

int main(int argc, char *argv[]) {
  if (argc == 1) {
    list_t * entries = dir_list(".", 0);
    list_iter(entries, &display_fs_node);
    list_iter(entries, &free);
    list_dispose(entries);
    exit(EXIT_SUCCESS);
  } else {
    char ret_dir[1024];
    getcwd(ret_dir, sizeof(ret_dir));
    printf("cwd = %s\n", ret_dir);
    for (int i = 1; i < argc; i++) {
      printf("\n\n");
      const char * dir_name = argv[i];
      chdir(dir_name);
      list_t * entries = dir_list(".", 0);
      list_iter(entries, &display_fs_node);
      list_iter(entries, &free);
      list_dispose(entries);
      chdir(ret_dir);
    }
    exit(EXIT_SUCCESS);
  }
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