#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <limits.h>
#include "lib/user_input.h"
#include "lib/list.h"
#include "lib/hash.h"
#include "lib/util.h"
#include "lib/bintree.h"

/* GLOBAL VARIABLES */
char    countries[NUMC][BUFSIZ];
char    alternate[NUMA][BUFSIZ];
char    questions[NUMQ][BUFSIZ];
int32_t q_answers[NUMC][NUMQ+1];

void get_help(hash_table_t * hash_table);

int main(int argc, char * argv[]) {
  hash_table_t * hash_table;

  load_text("data/countries.csv", NUMC, countries);
  load_text("data/questions.csv", NUMQ, questions);
  hash_table = load_alts("data/alternates.csv", HTSZ, alternate);
  load_answ("data/answers.csv", NUMQ, q_answers);

  bintree_t * bt = bt_init();
  list_t * cvecs = NULL;
  for (int32_t i = NUMC-1; i >= 0; i--) {
    cvecs = list_cons(cvecs, q_answers[i]);
  }

  bt->data = cvecs;
  div_tree(bt);

  while (1) {
    if (bt_is_leaf(bt)) {
      list_t * cvecs = bt_get_data(bt);
      while (cvecs != NULL) {
        void * addr = list_head(cvecs);
        int32_t * cvec = (int32_t*)addr;
      }
    }
    int32_t ques_num = split_by(bt_get_data(bt));
    char * question = questions[ques_num];
    while (1) {
      printf("%s (yes/no/unknown): ", question);
      char * ans = get_input_string();
      if (strcmp(ans, "unknown") == 0) {
        get_help(hash_table);
      } else if (strcmp(ans, "yes") == 0) {
        bt = bt_get_left(bt);
        break;
      } else if (strcmp(ans, "no") == 0) {
        bt = bt_get_right(bt);
        break;
      } else {
        printf("invalid input, please respond with \"yes\" or \"no\"\n");
      }
    }
  }

  return 0;
}

void get_help(hash_table_t * ht) {
  printf("\n\n");
  printf("If you are not sure of an answer, you can check the database ");
  printf("for any country.\n");
  printf("Enter a country name to retrieve data: ");
  char * str = get_input_string();
  int32_t cfv;
  char * mst = match(lowercase(str), ht, alternate, &cfv);
  if (cfv < 100) {
    printf("Interpreting %s as %s (confidence: %d%%)\n", str, mst, cfv);
  }
  int32_t page = 1;
  printf("\n\n");
  printf("%s Facts (page %d)\n", mst, page);
  printf("------------------------------------------\n");
  int32_t cidx = -1;
  for (int32_t i = 0; i < NUMC; i++) {
    if (strcmp(countries[i], mst) == 0) {
      cidx = i;
    }
  }
  assert(cidx >= 0);
  for (int32_t i = 0; i < NUMQ; i++) {
    char * q = questions[i];
    char * a = q_answers[cidx][i+1] ? "YES" : "NO";
    printf("%s = %s\n", q, a);
    if (i % 20 == 19) {
      printf("------------------------------------------\n");
      WAIT();
      page++;
      printf("\n");
      printf("%s Facts (page %d)\n", mst, page);
      printf("------------------------------------------\n");
    }
  }
  printf("\n------------------------------------------\n\n");
}

#undef MIN
