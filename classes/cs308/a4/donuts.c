#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <time.h>
#include <stdbool.h>
#include <assert.h>
#include "./donuts.h"

// #define _DEBUG_

/******************************************************************************/
/* GLOBAL VARIABLES                                                           */
/******************************************************************************/
donut_ring_t    shared_ring;
pthread_mutex_t prod[MAXFLAVORS];
pthread_mutex_t cons[MAXFLAVORS];
pthread_cond_t  prod_cond[MAXFLAVORS];
pthread_cond_t  cons_cond[MAXFLAVORS];
pthread_t       thread_id[MAXCONSUMERS + MAXPRODUCERS];
pthread_t       sig_wait_id;
pthread_t       time_keeper_id;
int             numflavors;
int             numslots;
int             numconsumers;
int             numproducers;
int             numdozen;
pthread_mutex_t check_mutx[MAXCONSUMERS + MAXPRODUCERS];
struct timeval  check_time[MAXCONSUMERS + MAXPRODUCERS];
bool            t_finished[MAXCONSUMERS + MAXPRODUCERS];
bool            deadlock;

int main(int argc, char *argv[]) {
  // TODO(rhennigan): set these by looping over test parameters
  if (argc != 5) {
    printf("Invalid arguments\n");
    printf("Usage: donuts [numslots] [numconsumers] [numproducers] [numdozen]");
    printf("\n");
    exit(1);
  }
  numflavors   = MAXFLAVORS;
  numslots     = atoi(argv[1]);
  numconsumers = atoi(argv[2]);
  numproducers = atoi(argv[3]);
  numdozen     = atoi(argv[4]);

  struct timeval first_time, last_time;
  int arg_array[MAXPRODUCERS + MAXCONSUMERS];
  pthread_attr_t th_attr;
  int i;

  /**************************************************************************/
  /* INITIAL TIMESTAMP VALUE FOR PERFORMANCE MEASURE                        */
  /**************************************************************************/
  gettimeofday(&first_time, (struct timezone *)0);
  for (i = 0; i < numproducers + numconsumers; i++) {
    arg_array[i] = i;  // SET ARRAY OF ARGUMENT VALUES
    t_finished[i] = false;
  }

  /**************************************************************************/
  /* GENERAL PTHREAD MUTEX AND CONDITION INIT AND GLOBAL INIT               */
  /**************************************************************************/

  for (i = 0; i < numflavors; i++) {
    pthread_mutex_init(&prod[i], NULL);
    pthread_mutex_init(&cons[i], NULL);
    pthread_cond_init(&prod_cond[i], NULL);
    pthread_cond_init(&cons_cond[i], NULL);
  }

  for (i = 0; i < numconsumers + numproducers; i++) {
    pthread_mutex_init(&check_mutx[i], NULL);
  }

  for (i = 0; i < numflavors; i++) {
    shared_ring.outptr[i] = 0;
    shared_ring.in_ptr[i] = 0;
    shared_ring.serial[i] = 0;
    shared_ring.spaces[i] = numslots;
    shared_ring.donuts[i] = 0;
  }

  /**************************************************************************/
  /* SETUP FOR MANAGING THE SIGTERM SIGNAL, BLOCK ALL SIGNALS               */
  /**************************************************************************/
  sigset_t all_signals;
  int sigs[] = { SIGBUS, SIGSEGV, SIGFPE };
  int nsigs = sizeof(sigs) / sizeof(int);
  struct sigaction new_act;

  /* create signal set with all signals but SIGBUS, SIGSEGV, and SIGFPE */
  sigfillset(&all_signals);
  for (i = 0; i < nsigs; i++) {
    sigdelset(&all_signals, sigs[i]);
  }

  /* block everything remaining in all_signals */
  sigprocmask(SIG_BLOCK, &all_signals, NULL);

  /* initialize all_signals */
  sigfillset(&all_signals);
  for (i = 0; i < nsigs; i++) {
    new_act.sa_handler = sig_handler;
    new_act.sa_mask    = all_signals;
    new_act.sa_flags   = 0;
    if (sigaction(sigs[i], &new_act, NULL) == -1) {
      perror("can't set signals: ");
      exit(EXIT_FAILURE);
    }
  }

  for (i = 0; i < numproducers + numconsumers; i++) {
    check_in(i);
  }

  /**************************************************************************/
  /* CREATE SIGNAL HANDLER THREAD, PRODUCER AND CONSUMERS                   */
  /**************************************************************************/
  if (pthread_create(&sig_wait_id, NULL, sig_waiter, NULL) != 0) {
    printf("pthread_create failed ");
    exit(3);
  }

  pthread_attr_init(&th_attr);
  pthread_attr_setinheritsched(&th_attr, PTHREAD_INHERIT_SCHED);

#ifdef GLOBAL
  sched_struct.sched_priority = sched_get_priority_max(SCHED_OTHER);
  pthread_attr_setinheritsched(&th_attr, PTHREAD_EXPLICIT_SCHED);
  pthread_attr_setschedpolicy(&th_attr, SCHED_OTHER);
  pthread_attr_setschedparam(&th_attr, &sched_struct);
  pthread_attr_setscope(&th_attr, PTHREAD_SCOPE_SYSTEM);
#endif  // GLOBAL

  /* create all the producer threads */
  for (i = 0; i < numproducers; i++) {
    // printf("creating producer %d\n", i);
    if (pthread_create(&thread_id[i], &th_attr, producer,
                       (void *)&arg_array[i]) != 0) {
      printf("pthread_create failed ");
      exit(3);
    }
  }

  /* create all the consumer threads */
  for (i = numproducers; i < numconsumers + numproducers; i++) {
    // printf("creating consumer %d\n", i);
    if (pthread_create(&thread_id[i], &th_attr, consumer,
                       (void *)&arg_array[i]) != 0) {
      printf("pthread_create failed");
      exit(3);
    }
  }

  /* create the timekeeper thread */
  int tk = pthread_create(&time_keeper_id, &th_attr, time_keeper, NULL);
  if (tk != 0) {
    printf("pthread_create failed ");
    exit(3);
  }

  pthread_join(time_keeper_id, NULL);
  printf("0");
  exit(0);
}

/******************************************************************************/
/* PTHREAD PRODUCER ROUTINE...                                                */
/******************************************************************************/
void * producer(void * arg) {
  unsigned short xsub[3];
  struct timeval randtime;
  int sel;

  /* get thread id */
  int id = *(int *)arg;

  /* seed the random number generator */
  gettimeofday(&randtime, (struct timezone *)0);
  xsub[0] = (ushort)(randtime.tv_usec);
  xsub[1] = (ushort)(randtime.tv_usec >> 16);
  xsub[2] = (ushort)(pthread_self());

  while (1) {
    /* make a flavor selection */
    sel = nrand48(xsub) & 3;

    /* entering critical region; lock the mutex for this flavor */
    pthread_mutex_lock(&prod[sel]);

    /* if there's no room left in the buffer, thread will wait until signaled */
    while (shared_ring.spaces[sel] == 0) {
      pthread_cond_wait(&prod_cond[sel], &prod[sel]);
      /* consumer must signal prod_cond[sel] after freeing up a space */
    }

    /* increment the donut id for the selected flavor */
    shared_ring.serial[sel] += 1;

    /* insert a new donut */
    shared_ring.flavor[sel][shared_ring.in_ptr[sel]] = shared_ring.serial[sel];

    /* move in_ptr forward and cycle if necessary */
    shared_ring.in_ptr[sel] = (shared_ring.in_ptr[sel] + 1) % numslots;

    /* decrement the number of available spaces */
    shared_ring.spaces[sel] -= 1;

    /* increment the number of available donuts */
    shared_ring.donuts[sel] += 1;

    /* release our hold on the mutex for this flavor */
    pthread_mutex_unlock(&prod[sel]);

    /* signal cons_cond[sel] now that donuts are available */
    pthread_cond_signal(&cons_cond[sel]);
  }
  return NULL;
}

/******************************************************************************/
/* PTHREAD CONSUMER ROUTINE...                                                */
/******************************************************************************/
void * consumer(void * arg) {
  pthread_setcancelstate(PTHREAD_CANCEL_ENABLE, NULL);
  // pthread_setcanceltype(PTHREAD_CANCEL_ASYNCHRONOUS, NULL);

  int dz, dn, sel;
  unsigned short xsub[3];
  struct timeval randtime;
  donut_t c[MAXDOZENS][MAXFLAVORS][12 * MAXFLAVORS];
  int c_ptr[MAXFLAVORS];

  /* initialize the collection to zero */
  int i, j, k;
  for (i = 0; i < MAXDOZENS; i++) {
    for (j = 0; j < MAXFLAVORS; j++) {
      for (k = 0; k < 12; k++) {
        c[i][j][k] = (donut_t){ -1, 0 };
      }
    }
  }

  /* initialize collection pointers to zero */
  for (j = 0; j < MAXFLAVORS; j++) {
    c_ptr[j] = 0;
  }

  /* get thread id */
  int id = *(int *)arg;

  /* seed the random number generator */
  gettimeofday(&randtime, (struct timezone *)0);
  xsub[0] = (ushort)(randtime.tv_usec);
  xsub[1] = (ushort)(randtime.tv_usec >> 16);
  xsub[2] = (ushort)(pthread_self());

  for (dz = 0; dz < numdozen; dz++) {  // for each dozen
    for (dn = 0; dn < 12; dn++) {  // for each donut
      /* make a flavor selection */
      sel = nrand48(xsub) & 3;

      /* entering critical region */
      pthread_mutex_lock(&cons[sel]);

      /* if there are no donuts available, thread will wait until signaled */
      while (shared_ring.donuts[sel] == 0) {
        pthread_cond_wait(&cons_cond[sel], &cons[sel]);
      }

      /* remove a donut and add it to our collection */
      int d_id = shared_ring.flavor[sel][shared_ring.outptr[sel]];
      c[dz][sel][c_ptr[sel]++] = (donut_t){ sel, d_id };
      shared_ring.flavor[sel][shared_ring.outptr[sel]] = 0;

      /* move outptr forward and cycle if necessary */
      shared_ring.outptr[sel] = (shared_ring.outptr[sel] + 1) % numslots;

      /* increment the number of available spaces */
      shared_ring.spaces[sel] += 1;

      /* decrement the number of available donuts */
      shared_ring.donuts[sel] -= 1;

      /* release our hold on the mutex for this flavor */
      pthread_mutex_unlock(&cons[sel]);

      /* signal prod_cond[sel] now that production space is available */
      pthread_cond_signal(&prod_cond[sel]);

      /* check in, so the timekeeper thread doesn't think we're deadlocked */
      check_in(id);
    }

    /* reset collection pointers to zero */
    for (j = 0; j < MAXFLAVORS; j++) {
      c_ptr[j] = 0;
    }
    /* give other consumer threads a chance to run */
    usleep(1000);
  }

  /* let the timekeeper thread know that we're done */
  t_finished[id] = true;

  /* record the results */
#ifdef _DEBUG_
  output_c(id, c);
#endif  // _DEBUG_
  return NULL;
}

/******************************************************************************/
/* CONSUMER EXPORT RESULTS ROUTINE...                                         */
/******************************************************************************/
void output_c(int id, donut_t c[MAXDOZENS][MAXFLAVORS][12 * MAXFLAVORS]) {
  system("mkdir -p log/");

  time_t timer;
  char t_str[80];
  char time_string[80];
  struct tm tm_info;
  struct timeval ms;

  char file_name[80];
  snprintf(file_name, sizeof(file_name), "log/%d.txt", id - numproducers);
  FILE * fp = fopen(file_name, "w");

  time(&timer);
  localtime_r(&timer, &tm_info);
  strftime(t_str, 80, "%T", &tm_info);
  gettimeofday(&ms, NULL);
  snprintf(time_string, sizeof(time_string), "%s.%d",
           t_str, (int)ms.tv_usec / 1000);

  int dozen;
  for (dozen = 0; dozen < numdozen; dozen++) {
    fprintf(fp, "\n--------------------------------------------------------\n");
    fprintf(fp, "thread ID: %d\t", id);
    fprintf(fp, "time: %s\t", time_string);
    fprintf(fp, "dozen #: %d\n", dozen + 1);
    fprintf(fp, "\n");

    fprintf(fp, "plain\t\tjelly\t\tcoconut\t\thoney-dip");
    fprintf(fp, "\n");

    int flav, row = 0, done = 0;
    while (!done) {
      done = 1;
      for (flav = 0; flav < numflavors; flav++) {
        if (c[dozen][flav][row].id) {
          fprintf(fp, "  %d\t\t", c[dozen][flav][row].id);
          done = 0;
        } else {
          fprintf(fp, "\t\t");
        }
      }
      row += 1;
      fprintf(fp, "\n");
    }
  }
  fclose(fp);
}

/******************************************************************************/
/* PTHREAD ASYNCH SIGNAL HANDLER ROUTINE...                                   */
/******************************************************************************/
void * sig_waiter(void * arg) {
  sigset_t sigterm_signal;
  int * signo = arg;

  sigemptyset(&sigterm_signal);
  sigaddset(&sigterm_signal, SIGTERM);
  sigaddset(&sigterm_signal, SIGINT);

  if (sigwait(&sigterm_signal, signo) != 0) {
    printf("\n  sigwait() failed, exiting\n");
    exit(2);
  }
  printf("process going down on SIGNAL (number %d)\n\n", *signo);
  exit(1);
  return NULL;
}

/******************************************************************************/
/* PTHREAD SYNCH SIGNAL HANDLER ROUTINE...                                    */
/******************************************************************************/
void sig_handler(int sig) {
  pthread_t signaled_thread_id;
  int i, thread_index;

  signaled_thread_id = pthread_self();
  for (i = 0; i < (numconsumers + numproducers); i++) {
    if (signaled_thread_id == thread_id[i]) {
      thread_index = i;
      break;
    }
  }
  printf("\nThread %d took signal # %d, PROCESS HALT\n", thread_index, sig);
  exit(1);
}

/******************************************************************************/
/* FUNCTIONS FOR DEADLOCK DETECTION THREAD...                                 */
/******************************************************************************/
void check_in(int tid) {
  pthread_mutex_lock(&check_mutx[tid]);
  gettimeofday(&check_time[tid], (struct timezone *)0);
  pthread_mutex_unlock(&check_mutx[tid]);
}

long int elapsed_us(struct timeval *t2, struct timeval *t1) {
  long int usec1 = (t1->tv_usec + 1000000 * t1->tv_sec);
  long int usec2 = (t2->tv_usec + 1000000 * t2->tv_sec);
  return usec2 - usec1;
}

long int last_check_in() {
  int i = 0;
  long int max = -1;
  struct timeval current;
  for (i = numproducers; i < (numproducers + numconsumers - 1); i++) {
    if (!t_finished[i]) {
      gettimeofday(&current, (struct timezone *)0);
      long int t = elapsed_us(&current, &check_time[i]);
      max = t > max ? t : max;
    }
  }
  return max;
}

void * time_keeper(void * arg) {
  usleep(10000);
  long int t;
  while (1) {
    t = last_check_in();
    if (t > DEADLOCK_THRESHOLD) {
      printf("1");
      exit(0);
    }
    if (t == -1) {
      break;
    }
    usleep(TIME_KEEPER_PER);
  }
  pthread_exit(NULL);
}
